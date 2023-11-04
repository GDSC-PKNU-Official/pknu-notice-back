import db from 'src/db';

const createDepartmentTable = async () => {
  const createTableQuery = `CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    college_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    department_subname VARCHAR(100) NOT NULL,
    department_link VARCHAR(255) NOT NULL,
    graduation_link VARCHAR(255)
);`;

  try {
    await db.execute(createTableQuery);
    console.log('학과 테이블 생성 성공!');
  } catch (error) {
    console.log('학과 테이블 생성 실패', error);
  }
};

const createMajorNoticeTable = async () => {
  const createTableQuery = `CREATE TABLE major_notices (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                link VARCHAR(255) NOT NULL UNIQUE,
                upload_date VARCHAR(20) NOT NULL,
                rep_yn BOOLEAN,
                department_id INT NOT NULL,
                FOREIGN KEY (department_id) REFERENCES departments(id)
            );`;
  try {
    await db.execute(createTableQuery);
    console.log('학과 공지사항 테이블 생성 성공!');
  } catch (error) {
    console.log('학과 공지사항 테이블 생성 실패', error);
  }
};

const createNoticeTable = async () => {
  const createTableQuery = `CREATE TABLE notices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL UNIQUE,
    uploadDate VARCHAR(20) NOT NULL,
    author VARCHAR(50) NOT NULL,
    rep_yn BOOLEAN,
    category ENUM('SCHOOL', 'LANGUAGE') NOT NULL
        );`;

  try {
    await db.execute(createTableQuery);
    console.log('공지사항 테이블 생성 성공!');
  } catch (error) {
    console.log('공지사항 테이블 생성 실패', error);
  }
};

const createSubscribeTable = async () => {
  const createTableQuery = `CREATE TABLE subscribe_users (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                user VARCHAR(600) NOT NULL UNIQUE,
                department_id INT NOT NULL,
                FOREIGN KEY (department_id) REFERENCES departments(id)
            );`;

  try {
    await db.execute(createTableQuery);
    console.log('알림 구독 테이블 생성 성공!');
  } catch (error) {
    console.log('알림 구독 테이블 생성 실패', error);
  }
};

const createSubscribeKeywordTable = async () => {
  const createTableQuery = `CREATE TABLE subscribe_keywords (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                keyword VARCHAR(100) NOT NULL UNIQUE,
                user_id BIGINT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES subscribe_users(id)
            );`;

  try {
    await db.execute(createTableQuery);
    console.log('알림 구독 키워드 테이블 생성 성공!');
  } catch (error) {
    console.log('알림 구독 키워드 테이블 생성 실패', error);
  }
};

const createWhalebeDataTable = async () => {
  const createTableQuery = `CREATE TABLE whalebe (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL UNIQUE,
    operating_period VARCHAR(30) NOT NULL,
    recruitment_period VARCHAR(30) NOT NULL,
    imgurl VARCHAR(500) NOT NULL
        );`;

  try {
    await db.execute(createTableQuery);
    console.log('웨일비 테이블 생성 성공!');
  } catch (error) {
    console.log('웨일비 테이블 생성 실패', error);
  }
};

const createRecruitNoticeTable = async () => {
  const createTableQuery = `CREATE TABLE recruit_notices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL UNIQUE,
    upload_date VARCHAR(30) NOT NULL,
    recruitment_period VARCHAR(30) NOT NULL
        );`;

  try {
    await db.execute(createTableQuery);
    console.log('채용 공지 테이블 생성 성공!');
  } catch (error) {
    console.log('채용 공지 생성 실패', error);
  }
};

const createAllTables = () => {
  createDepartmentTable();
  createMajorNoticeTable();
  createNoticeTable();
  createSubscribeTable();
  createSubscribeKeywordTable();
  createWhalebeDataTable();
  createRecruitNoticeTable();
};

export default createAllTables;
