import env from '@config';
import mysql from 'mysql2';

let DBHost;

if (process.env.NODE_ENV === 'development') {
  DBHost = 'database';
} else {
  DBHost = env.DB_HOST;
}
const db = mysql.createConnection({
  host: DBHost,
  user: env.DB_USER,
  password: env.DB_PW,
  database: env.DB_NAME,
});

db.connect((error) => {
  if (error) {
    console.error('MySQL 연결 실패:', error);
  } else {
    console.log('MySQL 연결 성공!');
  }
});

export default db;
