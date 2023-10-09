import { WhalebeData } from '@crawling/whalebeCrawling';
import db from '@db/index';
import { Notice } from 'src/@types/college';
import notificationToSlack from 'src/hooks/notificateToSlack';

interface SeparateNoti {
  고정: Notice[];
  일반: Notice[];
}

const getNoticesFromTable = (tableName: string) => {
  return new Promise<Notice[]>((resolve, reject) => {
    const getNoticesQuery = `SELECT * FROM ${tableName} ORDER BY STR_TO_DATE(uploadDate, '%Y-%m-%d') DESC;`;
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

export const getWhalebe = async (): Promise<WhalebeData[]> => {
  const query = 'SELECT * FROM 웨일비;';
  return new Promise<WhalebeData[]>((resolve) => {
    db.query(query, (err, res) => {
      if (err) notificationToSlack('웨일비 조회 실패');
      const whalebeData = res as WhalebeData[];
      const today = new Date();
      const todayString = `${today.getFullYear()}.${String(
        today.getMonth() + 1,
      ).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

      const filteredData = whalebeData
        .filter((data) => data.date >= todayString)
        .slice(0, 7);
      resolve(filteredData);
    });
  });
};
