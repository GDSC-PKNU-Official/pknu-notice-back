import { College } from 'src/@types/college';
import db from 'src/db';

const createNoticeTable = (college: College[]) => {
  for (const data of college) {
    const major =
      data.departmentSubName !== '-'
        ? data.departmentSubName
        : data.departmentName;
    const createTableQuery = `CREATE TABLE ${major} (
              id INT PRIMARY KEY AUTO_INCREMENT,
              major VARCHAR(255) NOT NULL,
              title VARCHAR(255) NOT NULL,
              link VARCHAR(255) NOT NULL,
              content TEXT NOT NULL,
              uploadDate VARCHAR(255) NOT NULL,
              graduate VARCHAR(255)
          );`;

    db.query(createTableQuery, (error) => {
      if (error) {
        console.log('테이블 생성 실패', error);
      } else {
        console.log('테이블 생성 성공!');
      }
    });
  }
};

export default createNoticeTable;
