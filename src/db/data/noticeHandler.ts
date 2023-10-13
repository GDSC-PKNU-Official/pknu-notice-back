import {
  noticeContentCrawling,
  noticeCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import { whalebeCrawling } from '@crawling/whalebeCrawling';
import { RowDataPacket } from 'mysql2';
import { College, Notice } from 'src/@types/college';
import db from 'src/db';
import notificationToSlack from 'src/hooks/notificateToSlack';

export interface PushNoti {
  [key: string]: string[];
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

const saveNotice = (notice: Notice, major: string): Promise<void> => {
  const saveNoticeQuery =
    'INSERT INTO ' + major + ' (title, link, uploadDate) VALUES (?, ?, ?)';
  const values = [notice.title, notice.path, notice.date];

  return new Promise((resolve) => {
    db.query(saveNoticeQuery, values, (err) => {
      if (err) {
        console.log(`${major} 공지사항 입력 실패`);
        resolve();
        return;
      }
      console.log(`${major} 공지사항 입력 성공`);
      resolve();
    });
  });
};

export const saveNoticeToDB = async (): Promise<PushNoti> => {
  const selectQuery = 'SELECT * FROM departments;';
  const results = await new Promise<College[]>((resolve) => {
    db.query(selectQuery, (error, results) => {
      if (error) {
        notificationToSlack(selectQuery + '실패');
        resolve([]);
        return;
      }
      resolve(results as College[]);
    });
  });

  const savePromises: Promise<void>[] = [];
  const newNoticeMajor: PushNoti = {};

  for (const row of results) {
    const college: College = {
      collegeName: row.collegeName,
      departmentName: row.departmentName,
      departmentSubName: row.departmentSubName,
      departmentLink: row.departmentLink,
    };

    const noticeLink = await noticeCrawling(college);
    const noticeLists = await noticeListCrawling(noticeLink);
    if (
      noticeLists.normalNotice.length === 0 &&
      noticeLists.pinnedNotice.length === 0
    ) {
      notificationToSlack(`${noticeLink} 크롤링 실패`);
      continue;
    }

    const major =
      college.departmentSubName === '-'
        ? college.departmentName
        : college.departmentSubName;

    if (noticeLists.pinnedNotice !== undefined) {
      const pinnedNotiQuery = `SELECT link FROM ${major}고정;`;
      db.query(pinnedNotiQuery, async (err, res) => {
        if (err) {
          await notificationToSlack(pinnedNotiQuery.split('ORDER')[0] + '에러');
          return;
        }
        const rows = res as RowDataPacket[];
        let pinnedNotiLink: string[] = [];

        if (Array.isArray(rows) && rows.length > 0)
          pinnedNotiLink = rows.map((row) => row.link);

        for (const notice of noticeLists.pinnedNotice) {
          const result = await noticeContentCrawling(notice);
          if (result.path === '') {
            notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
            continue;
          }
          if (!pinnedNotiLink.includes(result.path)) {
            savePromises.push(saveNotice(result, major + '고정'));
          }
        }
      });
    }

    const normalNotiQuery = `SELECT link FROM ${major}일반;`;
    db.query(normalNotiQuery, async (err, res) => {
      if (err) {
        await notificationToSlack(normalNotiQuery.split('ORDER')[0] + '에러');
        return;
      }

      const rows = res as RowDataPacket[];
      let normalNotiLink: string[] = [];
      if (Array.isArray(rows) && rows.length > 0)
        normalNotiLink = rows.map((row) => row.link);

      for (const notice of noticeLists.normalNotice) {
        const result = await noticeContentCrawling(notice);
        if (result.path === '') {
          notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
          continue;
        }

        if (!normalNotiLink.includes(result.path)) {
          if (!newNoticeMajor[major]) newNoticeMajor[major] = [];
          newNoticeMajor[major].push(result.title);
          savePromises.push(saveNotice(result, major + '일반'));
        }
      }
    });
  }

  await Promise.all(savePromises);
  return newNoticeMajor;
};

const saveSchoolNotice = async (
  notices: string[],
  mode: string,
): Promise<Promise<void>[]> => {
  const query = `SELECT link FROM 학교${mode} ORDER BY STR_TO_DATE(uploadDate, '%Y-%m-%d') DESC LIMIT 1;`;
  const res = await new Promise<string>((resolve) => {
    db.query(query, async (err, res) => {
      if (err) {
        await notificationToSlack(query.split('ORDER')[0]);
        resolve('');
        return;
      }
      const rows = res as RowDataPacket[];
      if (Array.isArray(rows) && rows.length > 0) {
        const link = rows[0].link;
        resolve(link);
      }
      resolve('');
    });
  });

  const saveNoticeQuery = `INSERT INTO 학교${mode} (title, link, uploadDate) VALUES (?, ?, ?);`;
  const savePromises: Promise<void>[] = [];

  for (const list of notices) {
    const notice = await noticeContentCrawling(list);
    if (notice.path === '') {
      notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
      continue;
    }
    if (res === notice.path) break;

    savePromises.push(
      new Promise<void>((resolve) => {
        const values = [notice.title, notice.path, notice.date];
        db.query(saveNoticeQuery, values, async (error) => {
          if (error) {
            console.log('학교 공지사항 입력 실패!');
            resolve();
            return;
          }
          console.log('학교 공지사항 입력 성공!');
          resolve();
        });
      }),
    );
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

    return new Promise<void>((resolve) => {
      db.query(query, values, () => {
        resolve();
      });
    });
  });

  Promise.all(promises);
};
