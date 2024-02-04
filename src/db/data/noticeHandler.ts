import {
  noticeContentCrawling,
  noticeCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import { whalebeCrawling } from '@crawling/whalebeCrawling';
import { selectQuery } from '@db/query/dbQueryHandler';
import { PoolConnection } from 'mysql2/promise';
import { College, Notices, NoticeCategory } from 'src/@types/college';
import { PKNU_URL } from 'src/config/crawlingURL';
import db from 'src/db';
import notificationToSlack from 'src/hooks/notificateToSlack';

export interface PushNoti {
  [key: number]: string[];
}

interface NotiLink {
  link: string;
  rep_yn: boolean;
}

export const saveDepartmentToDB = async (college: College[]): Promise<void> => {
  const saveCollegePromises = college.map(async (data) => {
    const saveCollegeQuery = `INSERT INTO departments (college_name, department_name, department_subname, department_link, graduation_link) VALUES ('${data.college_name}', '${data.department_name}', '${data.department_subname}', '${data.department_link}', '${data.graduation_link}');`;

    try {
      await db.execute(saveCollegeQuery);
      console.log('단과대 입력 성공!');
    } catch (error) {
      await notificationToSlack(`DB에 학과 삽입 실패`);
    }
  });

  await Promise.all(saveCollegePromises);
};

const saveMajorNotice = async (
  notice: Notices,
  departmentId: number,
  isPinned: boolean,
  connection?: PoolConnection,
): Promise<void> => {
  const saveNoticeQuery =
    'INSERT INTO major_notices (title, link, upload_date, rep_yn, department_id) VALUES (?, ?, ?, ?, ?)';
  const values = [
    notice.title,
    notice.link,
    notice.upload_date,
    isPinned,
    departmentId,
  ];

  try {
    if (connection) await connection.execute(saveNoticeQuery, values);
    else await db.execute(saveNoticeQuery, values);
    console.log(`ID: ${departmentId} 공지사항 입력 성공`);
  } catch (error) {
    console.log(error.message + '공지사항 입력 실패');
  }
};

const convertAllNoticeToNormalNotice = async (
  tableName: string,
  connection?: PoolConnection,
): Promise<void> => {
  const query = `UPDATE ${tableName} SET rep_yn = false;`;

  try {
    if (connection) await connection.execute(query);
    else await db.execute(query);
    console.log('모든 공지를 일반 공지로 변경');
  } catch (error) {
    notificationToSlack(error.message + '\n모든 공지를 일반 공지로 변경 실패');
  }
};

const convertSpecificNoticePinned = async (
  tableName: string,
  noticeLink: string,
  isPinned: boolean,
  connection?: PoolConnection,
): Promise<void> => {
  const query = `UPDATE ${tableName} SET rep_yn = ${isPinned} WHERE link = '${noticeLink}';`;

  try {
    if (connection) await connection.execute(query);
    else await db.execute(query);
  } catch (error) {
    console.log(error.message + '고정 공지로 변경 실패');
    // notificationToSlack(error.message + '\n 고정 공지로 변경 실패');
  }
};

export const saveMajorNoticeToDB = async (): Promise<PushNoti> => {
  // await convertAllNoticeToNormalNotice('major_notices', connection);
  const query = 'SELECT * FROM departments;';
  const colleges = await selectQuery<College[]>(query);

  const newNoticeMajor: PushNoti = {};
  const failedMajor: number[] = [];

  const savePromises = colleges.map(async (college) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
      console.log(college.id);
      const noticeLink = await noticeCrawling(college);
      const noticeLists = await noticeListCrawling(noticeLink);
      const normalNotices = noticeLists.normalNotice;
      const pinnedNotices = noticeLists.pinnedNotice;
      const getNotiLinkQuery = `SELECT link, rep_yn FROM major_notices WHERE department_id = '${college.id}'`;
      const noticeDataInDB = await selectQuery<NotiLink[]>(
        getNotiLinkQuery,
        connection,
      );
      const noticeLinksInDB = noticeDataInDB.map((noti) => noti.link);
      const pinnedNoticeLinksInDB = noticeDataInDB
        .filter((noti) => noti.rep_yn === true)
        .map((noti) => noti.link);

      if (normalNotices.length === 0) {
        notificationToSlack(`${noticeLink} 크롤링 실패`);
        connection.release();
        return;
      }

      for (const notice of normalNotices) {
        const result = await noticeContentCrawling(notice);
        if (result.link === '') {
          // notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
          continue;
        }

        if (noticeLinksInDB.includes(result.link)) return;
        if (!newNoticeMajor[college.id]) newNoticeMajor[college.id] = [];
        newNoticeMajor[college.id].push(result.title);
        saveMajorNotice(result, college.id, false, connection);
        noticeLinksInDB.push(result.link);
      }

      if (pinnedNotices) {
        await pinnedNoticeLinksInDB
          .filter((noti) => !pinnedNotices.includes(noti))
          .map(
            async (noti) =>
              await convertSpecificNoticePinned(
                'major_notices',
                noti,
                false,
                connection,
              ),
          );
        for (const notice of pinnedNotices) {
          const result = await noticeContentCrawling(notice);
          if (result.link === '') {
            notificationToSlack(`${notice} 콘텐츠 크롤링 실패`);
            continue;
          }

          if (!noticeLinksInDB.includes(result.link)) {
            saveMajorNotice(result, college.id, true, connection);
            continue;
          }

          if (!pinnedNoticeLinksInDB.includes(result.link))
            convertSpecificNoticePinned(
              'major_notices',
              result.link,
              true,
              connection,
            );
        }
      }

      connection.commit();
    } catch (error) {
      notificationToSlack(college.id + '크롤링 실패' + error.message);
      failedMajor.push(college.id);
      connection.rollback();
    } finally {
      connection.release();
    }
  });

  await Promise.all(savePromises);
  if (failedMajor.length !== 0) {
    const failedMajorList = failedMajor.join();
    notificationToSlack('크롤링 실패한 학과: ' + failedMajorList);
  }

  return newNoticeMajor;
};

const saveNotice = async (
  notice: Notices,
  isPinned: boolean,
  category: NoticeCategory,
): Promise<void> => {
  const saveNoticeQuery = `INSERT INTO notices (title, link, upload_date, author, rep_yn, category) VALUES (?, ?, ?, ?, ?, ?);`;
  const values = [
    notice.title,
    notice.link,
    notice.upload_date,
    notice.author ? notice.author : '부경대학교',
    isPinned,
    category,
  ];

  try {
    await db.execute(saveNoticeQuery, values);
    console.log('학교 공지사항 입력 성공');
  } catch (error) {
    console.log(error.message + '학교 공지사항 입력 실패');
  }
};

export const saveSchoolNoticeToDB = async (): Promise<void> => {
  await convertAllNoticeToNormalNotice('notices');
  const query = `SELECT link FROM notices WHERE category = 'SCHOOL';`;
  const schoolNoticeLinksInDB = (await selectQuery<NotiLink[]>(query)).map(
    (schoolNotiLink) => schoolNotiLink.link,
  );

  const noticeLists = await noticeListCrawling(PKNU_URL.main_homepage_notice);
  const pinnedNotices = noticeLists.pinnedNotice;
  const normalNotices = noticeLists.normalNotice;

  for (const noticeLink of pinnedNotices) {
    if (schoolNoticeLinksInDB.includes(noticeLink)) {
      await convertSpecificNoticePinned('notices', noticeLink, true);
      continue;
    }

    const notice = await noticeContentCrawling(noticeLink);
    await saveNotice(notice, true, 'SCHOOL');
  }

  for (const noticeLink of normalNotices) {
    if (schoolNoticeLinksInDB.includes(noticeLink)) continue;

    const notice = await noticeContentCrawling(noticeLink);
    await saveNotice(notice, false, 'SCHOOL');
  }
};

export const saveWhalebeToDB = async (): Promise<void> => {
  const query =
    'INSERT INTO whalebe (title, link, operating_period, recruitment_period, imgurl) VALUES (?, ?, ?, ?, ?)';
  const whalebeDatas = await whalebeCrawling();

  // TODO: 웨일비 크롤링하는 데이터 추가해야함
  const promises = whalebeDatas.map(async (data) => {
    const values = [
      data.title,
      data.link,
      data.operating_period,
      data.recruitment_period,
      data.imgurl,
    ];

    try {
      const result = await db.execute(query, values);
      return result;
    } catch (error) {
      console.log(error.message);
    }
  });

  Promise.all(promises);
};
