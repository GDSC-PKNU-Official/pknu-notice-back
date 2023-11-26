import { selectQuery } from '@db/query/dbQueryHandler';
import { NoticeCategory, Notices, WhalebeData } from 'src/@types/college';
import notificationToSlack from 'src/hooks/notificateToSlack';
import { getDepartmentIdByMajor } from 'src/utils/majorUtils';

interface SeparateNoti {
  고정: Notices[];
  일반: Notices[];
}

const getNoticesFromTable = async (
  tableName: string,
  category: NoticeCategory,
) => {
  const getNoticesQuery = `SELECT * FROM ${tableName} WHERE category = '${category}' ORDER BY STR_TO_DATE(upload_date, '%Y-%m-%d') DESC;`;
  try {
    const notices = await selectQuery<Notices[]>(getNoticesQuery);
    return notices;
  } catch (error) {
    notificationToSlack(error.message + 'notices 테이블 조회 실패');
    return [];
  }
};

export const getNotices = async (department: string): Promise<SeparateNoti> => {
  const majorId = await getDepartmentIdByMajor(department);
  const query = `SELECT * FROM major_notices WHERE department_id = ${majorId};`;
  const major_notices = await selectQuery<Notices[]>(query);
  console.log(major_notices);

  const notices: SeparateNoti = {
    고정: [...major_notices.filter((notice) => notice.rep_yn === 1)],
    일반: [...major_notices],
  };

  return notices;
};

export const getSchoolNotices = async (): Promise<SeparateNoti> => {
  const noticeLists = await getNoticesFromTable('notices', 'SCHOOL');

  const notices: SeparateNoti = {
    고정: [...noticeLists.filter((notice) => notice.rep_yn === 1)],
    일반: [...noticeLists],
  };

  return notices;
};

export const getWhalebe = async (): Promise<WhalebeData[]> => {
  const query = 'SELECT * FROM whalebe;';

  try {
    const whalebeData = await selectQuery<WhalebeData[]>(query);
    const today = new Date();
    const todayString = `${today.getFullYear()}.${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const filteredData = whalebeData
      .filter((data) => data.date >= todayString)
      .slice(0, 7);
    return filteredData;
  } catch (error) {
    notificationToSlack('웨일비 조회 실패');
    return;
  }
};

export const getLanguage = async (): Promise<Notices[]> => {
  const languageNotices = await getNoticesFromTable('notices', 'LANGUAGE');
  return languageNotices;
};
