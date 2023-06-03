import {
  noticeContentCrawling,
  noticeCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import { College, Notice } from 'src/@types/college';
import db from 'src/db';

export const saveDepartmentToDB = async (college: College[]) => {
  for (const data of college) {
    const saveCollegeQuery = `INSERT INTO departments (collegeName, departmentName, departmentSubName, departmentLink) VALUES ('${data.collegeName}', '${data.departmentName}', '${data.departmentSubName}', '${data.departmentLink}');`;

    db.query(saveCollegeQuery, (error) => {
      if (error) {
        console.error('데이터 입력 실패', error);
      } else {
        console.log('단과대 입력 성공!');
      }
    });
  }
};

const saveNotice = (notice: Notice, major: string) => {
  const saveNoticeQuery =
    'INSERT INTO ' +
    major +
    ' (major, title, link, content, uploadDate) VALUES (?, ?, ?, ?, ?)';
  const values = [
    major,
    notice.title,
    notice.path,
    notice.description,
    notice.date,
  ];

  db.query(saveNoticeQuery, values, (error) => {
    if (error) {
      console.error('데이터 입력 실패', error);
    } else {
      console.log('공지사항 입력 성공!');
    }
  });
};

export const saveNoticeToDB = async () => {
  const selectQuery = 'SELECT * FROM departments';
  db.query(selectQuery, async (error, results) => {
    if (error) {
      console.error('SELECT 오류:', error);
    } else {
      for (const row of results as College[]) {
        const college: College = {
          collegeName: row.collegeName,
          departmentName: row.departmentName,
          departmentSubName: row.departmentSubName,
          departmentLink: row.departmentLink,
        };

        const noticeLink = await noticeCrawling(college);
        const noticeList = await noticeListCrawling(noticeLink);
        for (const notice of noticeList) {
          const result = await noticeContentCrawling(notice);
          const major =
            college.departmentSubName === '-'
              ? college.departmentName
              : college.departmentSubName;
          saveNotice(result, major);
        }
      }
    }
  });
};
