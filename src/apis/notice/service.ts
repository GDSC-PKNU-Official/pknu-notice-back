import { selectQuery } from '@db/query/dbQueryHandler';
import {
  NoticeCategory,
  Notices,
  RecruitData,
  WhalebeData,
} from 'src/@types/college';
import notificationToSlack from 'src/hooks/notificateToSlack';
import { getDepartmentIdByMajor } from 'src/utils/majorUtils';

interface SeparateNoti {
  고정: ResponseNotice[];
  일반: ResponseNotice[];
}

export interface ResponseNotice {
  title: string;
  link: string;
  author?: string;
  uploadDate: string;
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

const updateNotice = (notices: Notices[]) => {
  return notices.map((notice) => {
    const { title, link, author, upload_date } = notice;
    return { title, link, author, uploadDate: upload_date };
  });
};

export const getNotices = async (department: string): Promise<SeparateNoti> => {
  const majorId = await getDepartmentIdByMajor(department);
  const query = `SELECT * FROM major_notices WHERE department_id = ${majorId};`;
  const major_notices = await selectQuery<Notices[]>(query);

  const notices: SeparateNoti = {
    고정: updateNotice(major_notices.filter((notice) => notice.rep_yn === 1)),
    일반: updateNotice(major_notices),
  };

  return notices;
};

export const getSchoolNotices = async (): Promise<SeparateNoti> => {
  const noticeLists = await getNoticesFromTable('notices', 'SCHOOL');

  const notices: SeparateNoti = {
    고정: updateNotice(noticeLists.filter((notice) => notice.rep_yn === 1)),
    일반: updateNotice(noticeLists),
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
      .filter(
        (data) =>
          data.recruitment_period.split('~')[1].trim() >= todayString || data,
      )
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

export const getRecruit = async (): Promise<RecruitData[]> => {
  const query = 'SELECT * FROM recruit_notices;';
  const recruitNotices = await selectQuery<RecruitData[]>(query);
  recruitNotices.sort(
    (notice1, notice2) =>
      new Date(notice2.recruitment_period.split('~')[0]).getTime() -
      new Date(notice1.recruitment_period.split('~')[0]).getTime(),
  );
  console.log(recruitNotices);
  return recruitNotices;
};
