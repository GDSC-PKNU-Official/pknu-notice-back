import {
  noticeContentCrawling,
  noticeCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import { whalebeCrawling } from '@crawling/whalebeCrawling';
import { selectQuery } from '@db/query/dbQueryHandler';
import { College, Notice } from 'src/@types/college';
import db from 'src/db';
import notificationToSlack from 'src/hooks/notificateToSlack';

export interface PushNoti {
  [key: number]: string[];
}

interface NotiLink {
  link: string;
}

export const saveDepartmentToDB = async (college: College[]): Promise<void> => {
  const saveCollegePromises = college.map((data) => {
    const saveCollegeQuery = `INSERT INTO departments (collegeName, departmentName, departmentSubName, departmentLink) VALUES ('${data.collegeName}', '${data.departmentName}', '${data.departmentSubName}', '${data.departmentLink}');`;
    return new Promise<void>((resolve) => {
      db.query(saveCollegeQuery, async (error) => {
        if (error) {
          await notificationToSlack(`DB에 학과 삽입 실패`);
          resolve();
          return;
        }
        console.log('단과대 입력 성공!');
        resolve();
      });
    });
  });

  await Promise.all(saveCollegePromises);
};

const saveMajorNotice = async (
  notice: Notice,
  departmentId: number,
  isPinned: boolean,
): Promise<void> => {
  const saveNoticeQuery =
    'INSERT INTO major_notices (title, link, upload_date, rep_yn, department_id) VALUES (?, ?, ?, ?, ?)';
  const values = [
    notice.title,
    notice.path,
    notice.date,
    departmentId,
    isPinned,
  ];

  try {
    await db.execute(saveNoticeQuery, values);
    console.log(`공지사항 입력 성공`);
  } catch (err) {
    console.log(`공지사항 입력 실패`);
  }
};

export const saveNoticeToDB = async (): Promise<PushNoti> => {
  const query = 'SELECT * FROM departments;';
  const colleges = await selectQuery<College[]>(query);

  const getNotiLinkQuery = `SELECT link FROM major_notices;`;
  const noticeLinksInDB = (await selectQuery<NotiLink[]>(getNotiLinkQuery)).map(
    (noticeLink) => noticeLink.link,
  );

  const savePromises: Promise<void>[] = [];
  const newNoticeMajor: PushNoti = {};

  for (const college of colleges) {
    const noticeLink = await noticeCrawling(college);
    const noticeLists = await noticeListCrawling(noticeLink);

    const normalNotices = noticeLists.normalNotice;
    const pinnedNotices = noticeLists.pinnedNotice;

    if (normalNotices.length + pinnedNotices.length === 0) {
      notificationToSlack(`${noticeLink} 크롤링 실패`);
      continue;
    }

    for (const notice of pinnedNotices) {
      const result = await noticeContentCrawling(notice);
      if (result.path === '') {
        notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
        continue;
      }

      if (!noticeLinksInDB.includes(result.path))
        savePromises.push(saveMajorNotice(result, college.id, true));

      // TODO: 고정 공지사항에서 제거된 경우 rep_yn => false 로 변경하는 로직 추가 필요
    }

    for (const notice of normalNotices) {
      const result = await noticeContentCrawling(notice);
      if (result.path === '') {
        notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
        continue;
      }

      if (!noticeLinksInDB.includes(result.path)) {
        if (!newNoticeMajor[college.id]) newNoticeMajor[college.id] = [];
        newNoticeMajor[college.id].push(result.title);
        savePromises.push(saveMajorNotice(result, college.id, false));
      }
    }
  }

  await Promise.all(savePromises);
  return newNoticeMajor;
};

const saveSchoolNotice = async (
  notices: string[],
  mode: string,
): Promise<Promise<void>[]> => {
  const query = `SELECT link FROM 학교${mode} ORDER BY STR_TO_DATE(uploadDate, '%Y-%m-%d') DESC LIMIT 1;`;
  const res = await selectQuery<NotiLink>(query);

  const saveNoticeQuery = `INSERT INTO 학교${mode} (title, link, uploadDate) VALUES (?, ?, ?);`;
  const savePromises: Promise<void>[] = [];

  for (const list of notices) {
    const notice = await noticeContentCrawling(list);
    if (notice.path === '') {
      notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
      continue;
    }
    if (res.link === notice.path) break;

    // savePromises.push(
    //   new Promise<void>((resolve) => {
    //     const values = [notice.title, notice.path, notice.date];
    //     db.query(saveNoticeQuery, values, async (error) => {
    //       if (error) {
    //         console.log('학교 공지사항 입력 실패!');
    //         resolve();
    //         return;
    //       }
    //       console.log('학교 공지사항 입력 성공!');
    //       resolve();
    //     });
    //   }),
    // );
  }

  return savePromises;
};

export const saveSchoolNoticeToDB = async (): Promise<void> => {
  const savePromises: Promise<void>[] = [];
  const pknuNoticeLink = 'https://www.pknu.ac.kr/main/163';
  const noticeLists = await noticeListCrawling(pknuNoticeLink);
  if (noticeLists.pinnedNotice !== undefined) {
    const pinnedNoticePromises = await saveSchoolNotice(
      noticeLists.pinnedNotice,
      '고정',
    );
    savePromises.push(...pinnedNoticePromises);
  }
  const normalNoticePromises = await saveSchoolNotice(
    noticeLists.normalNotice,
    '일반',
  );
  savePromises.push(...normalNoticePromises);

  await Promise.all(savePromises);
};

export const saveWhalebeToDB = async (): Promise<void> => {
  const query =
    'INSERT INTO 웨일비 (title, date, imgUrl, link) VALUES (?, ?, ?, ?)';
  const whalebeDatas = await whalebeCrawling();

  const promises = whalebeDatas.map((data) => {
    const values = [data.title, data.date, data.imgUrl, data.link];

    return db.execute(query, values);
  });

  Promise.all(promises);
};
