import db from '@db/index';
import { Notice } from 'src/@types/college';

export const getNotices = async (department: string): Promise<Notice[]> => {
  const notices: Notice[] = [];

  const getNoticesFromTable = (tableName: string) => {
    return new Promise<void>((resolve, reject) => {
      const getNoticesQuery = `SELECT * FROM ${tableName}`;
      db.query(getNoticesQuery, (err: Error, res: Notice[]) => {
        if (err) reject(err);
        notices.push(...res);
        resolve();
      });
    });
  };

  await Promise.all([
    getNoticesFromTable(`${department}고정`),
    getNoticesFromTable(`${department}일반`),
  ]);
  return notices;
};
