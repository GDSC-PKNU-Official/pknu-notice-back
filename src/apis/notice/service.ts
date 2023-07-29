import db from '@db/index';
import { Notice } from 'src/@types/college';

const getNoticesFromTable = (tableName: string) => {
  return new Promise<Notice[]>((resolve, reject) => {
    const getNoticesQuery = `SELECT * FROM ${tableName}`;
    db.query(getNoticesQuery, (err: Error, res: Notice[]) => {
      if (err) reject(err);
      if (res !== undefined && res.length > 0) resolve(res);
      resolve([]);
    });
  });
};

export const getNotices = async (department: string): Promise<Notice[]> => {
  const notices: Notice[] = [];

  const [fixNotices, normalNotices] = await Promise.all([
    getNoticesFromTable(`${department}고정`),
    getNoticesFromTable(`${department}일반`),
  ]);

  notices.push(...fixNotices, ...normalNotices);
  return notices;
};

export const getSchoolNotices = async (): Promise<Notice[]> => {
  const notices: Notice[] = [];

  const [fixNotices, normalNotices] = await Promise.all([
    getNoticesFromTable('학교고정'),
    getNoticesFromTable('학교일반'),
  ]);

  notices.push(...fixNotices, ...normalNotices);
  return notices;
};
