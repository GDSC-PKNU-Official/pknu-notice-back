import {
  noticeContentCrawling,
  noticeCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import { RowDataPacket } from 'mysql2';
import { College, Notice } from 'src/@types/college';
import db from 'src/db';
import notificationToSlack from 'src/hooks/notificateToSlack';

export const saveDepartmentToDB = async (college: College[]): Promise<void> => {
  const saveCollegePromises = college.map((data) => {
    const saveCollegeQuery = `INSERT INTO departments (collegeName, departmentName, departmentSubName, departmentLink) VALUES ('${data.collegeName}', '${data.departmentName}', '${data.departmentSubName}', '${data.departmentLink}');`;
    return new Promise<void>((resolve, reject) => {
      db.query(saveCollegeQuery, (error) => {
        if (error) {
          console.error('데이터 입력 실패', error);
          reject(error);
        } else {
          console.log('단과대 입력 성공!');
          resolve();
        }
      });
    });
  });

  await Promise.all(saveCollegePromises);
};

const saveNotice = (notice: Notice, major: string): Promise<void> => {
  const saveNoticeQuery =
    'INSERT INTO ' +
    major +
    ' (title, link, content, uploadDate) VALUES (?, ?, ?, ?)';
  const values = [notice.title, notice.path, notice.description, notice.date];

  return new Promise((resolve, reject) => {
    db.query(saveNoticeQuery, values, (error) => {
      if (error) {
        console.error('데이터 입력 실패', error);
        reject(error);
      } else {
        console.log(major + '공지사항 입력 성공!');
        resolve();
      }
    });
  });
};

export const saveNoticeToDB = async (): Promise<void> => {
  const selectQuery = 'SELECT * FROM departments;';
  const results = await new Promise<College[]>((resolve, reject) => {
    db.query(selectQuery, (error, results) => {
      if (error) {
        console.error('SELECT 오류:', error);
        reject(error);
      } else {
        resolve(results as College[]);
      }
    });
  });

  const savePromises: Promise<void>[] = [];

  for (const row of results) {
    const college: College = {
      collegeName: row.collegeName,
      departmentName: row.departmentName,
      departmentSubName: row.departmentSubName,
      departmentLink: row.departmentLink,
    };

    const noticeLink = await noticeCrawling(college);
    const noticeLists = await noticeListCrawling(noticeLink);
    if (noticeLists.normalNotice.length === 0) {
      notificationToSlack(`${noticeLink} 크롤링 실패`);
      continue;
    }

    const major =
      college.departmentSubName === '-'
        ? college.departmentName
        : college.departmentSubName;

    if (noticeLists.pinnedNotice !== undefined) {
      const pinnedNotiQuery = `SELECT link FROM ${major}고정 ORDER BY STR_TO_DATE(uploadDate, '%Y-%m-%d') DESC LIMIT 1;`;
      let pinnedNotiLink = '';
      db.query(pinnedNotiQuery, async (err, res) => {
        if (err) {
          console.log(err);
        } else {
          const rows = res as RowDataPacket[];
          if (Array.isArray(rows) && rows.length > 0) {
            pinnedNotiLink = rows[0].link;
          }
          for (const notice of noticeLists.pinnedNotice) {
            const result = await noticeContentCrawling(notice);
            if (result.path === pinnedNotiLink) break;
            savePromises.push(saveNotice(result, major + '고정'));
          }
        }
      });
    }

    const normalNotiQuery = `SELECT link FROM ${major}일반 ORDER BY STR_TO_DATE(uploadDate, '%Y-%m-%d') DESC LIMIT 1;`;
    let normalNotiLink = '';
    db.query(normalNotiQuery, async (err, res) => {
      if (err) {
        console.log(err);
      } else {
        try {
          const rows = res as RowDataPacket[];
          if (Array.isArray(rows) && rows.length > 0)
            normalNotiLink = rows[0].link;

          for (const notice of noticeLists.normalNotice) {
            const result = await noticeContentCrawling(notice);
            if (result.path === normalNotiLink) {
              break;
            }
            savePromises.push(saveNotice(result, major + '일반'));
          }
        } catch (error) {
          console.log('cheerio 에러', error);
        }
      }
    });
  }

  await Promise.all(savePromises);
};

const saveSchoolNotice = async (
  notices: string[],
  mode: string,
): Promise<Promise<void>[]> => {
  const query = `SELECT link FROM 학교${mode} ORDER BY STR_TO_DATE(uploadDate, '%Y-%m-%d') DESC LIMIT 1;`;
  const res = await new Promise<string>((resolve, reject) => {
    db.query(query, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const rows = res as RowDataPacket[];
        if (Array.isArray(rows) && rows.length > 0) {
          const link = rows[0].link;
          resolve(link);
        } else {
          resolve('');
        }
      }
    });
  });

  const saveNoticeQuery = `INSERT INTO 학교${mode} (title, link, content, uploadDate) VALUES (?, ?, ?, ?);`;
  const savePromises: Promise<void>[] = [];

  for (const list of notices) {
    const notice = await noticeContentCrawling(list);
    if (res === notice.path) break;

    savePromises.push(
      new Promise<void>((resolve, reject) => {
        const values = [
          notice.title,
          notice.path,
          notice.description,
          notice.date,
        ];
        db.query(saveNoticeQuery, values, (error) => {
          if (error) {
            console.error('데이터 입력 실패', error);
            reject(error);
          } else {
            console.log('학교 공지사항 입력 성공!');
            resolve();
          }
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
