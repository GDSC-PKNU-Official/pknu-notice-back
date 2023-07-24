import { College } from 'src/@types/college';
import db from 'src/db';

const createDepartmentTable = () => {
  const createTableQuery = `CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    collegeName VARCHAR(255) NOT NULL,
    departmentName VARCHAR(255) NOT NULL,
    departmentSubName VARCHAR(255) NOT NULL,
    departmentLink VARCHAR(255) NOT NULL
);`;

  db.query(createTableQuery, (error) => {
    if (error) {
      console.log('학과 테이블 생성 실패', error);
    } else {
      console.log('학과 테이블 생성 성공!');
    }
  });
};

const createNoticeTable = (college: College[]) => {
  for (const data of college) {
    const major =
      data.departmentSubName !== '-'
        ? data.departmentSubName
        : data.departmentName;
    for (const tableName of [`${major}고정`, `${major}일반`]) {
      const createTableQuery = `CREATE TABLE ${tableName} (
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
          console.log('학과공지 테이블 생성 성공!');
        }
      });
    }
  }
};

const createSchoolNoticeTable = () => {
  for (const tableName of [`학교고정`, `학교일반`]) {
    const createTableQuery = `CREATE TABLE ${tableName} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      link VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      uploadDate VARCHAR(255) NOT NULL
          );`;

    db.query(createTableQuery, (error) => {
      if (error) {
        console.log('테이블 생성 실패', error);
      } else {
        console.log('학교 테이블 생성 성공!');
      }
    });
  }
};

const createAllTables = (college: College[]) => {
  createDepartmentTable();
  createSchoolNoticeTable();
  createNoticeTable(college);
};

export default createAllTables;
