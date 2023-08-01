import db from '@db/index';
import { Notice } from 'src/@types/college';

interface SeparateNoti {
  고정: Notice[];
  일반: Notice[];
}

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

export const getNotices = async (department: string): Promise<SeparateNoti> => {
  const [fixNotices, normalNotices] = await Promise.all([
    getNoticesFromTable(`${department}고정`),
    getNoticesFromTable(`${department}일반`),
  ]);

  const notices: SeparateNoti = {
    고정: [...fixNotices],
    일반: [...normalNotices],
  };
  return notices;
};

export const getSchoolNotices = async (): Promise<SeparateNoti> => {
  const [fixNotices, normalNotices] = await Promise.all([
    getNoticesFromTable('학교고정'),
    getNoticesFromTable('학교일반'),
  ]);

  const notices: SeparateNoti = {
    고정: [...fixNotices],
    일반: [...normalNotices],
  };
  return notices;
};
