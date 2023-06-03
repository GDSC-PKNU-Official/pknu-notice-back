import { collegeCrawling } from '@crawling/collegeCrawling';
import db from 'src/db';

export const saveDepartmentToDB = async () => {
  const response = await collegeCrawling();
  for (const data of response) {
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
