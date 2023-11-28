import env from '@config';
import mysql from 'mysql2/promise';

let DBHost;

if (process.env.NODE_ENV === 'development') {
  DBHost = 'database';
} else {
  DBHost = env.DB_HOST;
}
const db = mysql.createPool({
  host: DBHost,
  user: env.DB_USER,
  password: env.DB_PW,
  database: env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export default db;
