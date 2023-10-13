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

const createGraduationTable = () => {
  const createGraduationQuery = `CREATE TABLE graduation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL
  );`;

  db.query(createGraduationQuery, (error) => {
    if (error) {
      console.log('졸업요건 테이블 생성 실패', error);
    } else {
      console.log('졸업요건 테이블 생성 성공!');
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
                title VARCHAR(255) NOT NULL,
                link VARCHAR(255) NOT NULL UNIQUE,
                uploadDate VARCHAR(255) NOT NULL
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

const createSubscribeTable = (college: College[]) => {
  for (const data of college) {
    const major =
      data.departmentSubName !== '-'
        ? data.departmentSubName
        : data.departmentName;

    const tableName = `${major}구독`;
    const createTableQuery = `CREATE TABLE ${tableName} (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user VARCHAR(600) NOT NULL UNIQUE
            );`;

    db.query(createTableQuery, (error) => {
      if (error) {
        console.log('테이블 생성 실패', error);
      } else {
        console.log('학과구독 테이블 생성 성공!');
      }
    });
  }
};

const createSchoolNoticeTable = () => {
  for (const tableName of [`학교고정`, `학교일반`]) {
    const createTableQuery = `CREATE TABLE ${tableName} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      link VARCHAR(255) NOT NULL UNIQUE,
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

const createWhalebeDataTable = () => {
  const createTableQuery = `CREATE TABLE 웨일비 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL UNIQUE,
    date VARCHAR(255) NOT NULL,
    imgUrl VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL
        );`;

  db.query(createTableQuery, (error) => {
    if (error) {
      console.log('웨일비 DB 생성 실패', error);
      return;
    }
    console.log('웨일비 테이블 생성 성공!');
  });
};

const createLanguageDataTable = () => {
  const createTableQuery = `CREATE TABLE 어학공지 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL UNIQUE,
    uploadDate VARCHAR(255) NOT NULL
        );`;

  db.query(createTableQuery, (error) => {
    if (error) {
      console.log('어학 DB 생성 실패', error);
      return;
    }
    console.log('어학 테이블 생성 성공!');
  });
};

const createAllTables = (college: College[]) => {
  createDepartmentTable();
  createWhalebeDataTable();
  createLanguageDataTable();
  createGraduationTable();
  createSchoolNoticeTable();
  createNoticeTable(college);
  createSubscribeTable(college);
};

export default createAllTables;
