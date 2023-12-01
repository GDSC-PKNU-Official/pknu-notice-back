import {
  noticeContentCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import db from '@db/index';
import { selectQuery } from '@db/query/dbQueryHandler';
import { Notices } from 'src/@types/college';
import { PKNU_URL } from 'src/config/crawlingURL';
import notificationToSlack from 'src/hooks/notificateToSlack';

interface NotiLink {
  link: string;
}

const saveRecruitToDB = async (noticeContent: Notices) => {
  const saveNoticeQuery =
    'INSERT INTO recruit_notices (title, link, recruitment_period) VALUES (?,?,?);';
  const values = [
    noticeContent.title,
    noticeContent.link,
    noticeContent.upload_date,
  ];

  try {
    await db.execute(saveNoticeQuery, values);
    console.log('채용공지 입력 성공');
  } catch (error) {
    notificationToSlack(error.message + '채용공지 입력 실패');
  }
};

export const recruitHandler = async () => {
  const query = 'SELECT link FROM recruit_notices;';
  const recruitLinksInDB = (await selectQuery<NotiLink[]>(query)).map(
    (noticeLink) => noticeLink.link,
  );
  const maxPageIndex = 3;

  for (let pageIndex = 1; pageIndex <= maxPageIndex; pageIndex++) {
    const noticeLists = await noticeListCrawling(
      PKNU_URL.RECRUIT_NOTICE(pageIndex),
      PKNU_URL.RECRUIT_NOTICE_HOSTLINK,
    );
    for (const noticeList of noticeLists.normalNotice) {
      if (recruitLinksInDB.includes(noticeList)) break;
      const noticeContent = await noticeContentCrawling(noticeList);
      saveRecruitToDB(noticeContent);
    }
  }
};
