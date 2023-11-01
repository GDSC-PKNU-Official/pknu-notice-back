import {
  noticeContentCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import db from '@db/index';
import { selectQuery } from '@db/query/dbQueryHandler';
import { PKNU_URL } from 'src/config/crawlingURL';
import notificationToSlack from 'src/hooks/notificateToSlack';

interface NotiLink {
  link: string;
}

export const saveLanguageNoticeToDB = async () => {
  const languageNotiLists1 = await noticeListCrawling(
    PKNU_URL.LANGUAGE_NOTICE_EXCHANGE_STUDENT,
    'https://www.pknu.ac.kr/main/163',
  );
  const languageNotiLists2 = await noticeListCrawling(
    PKNU_URL.LANGUAGE_NOTICE_LANGUAGE_TRANING,
    'https://www.pknu.ac.kr/main/163',
  );

  const lists = [
    ...languageNotiLists1.normalNotice,
    ...languageNotiLists2.normalNotice,
  ];

  const newNoticeTitle: string[] = [];

  const showDBQuery = `SELECT link FROM notices WHERE category = LANGUAGE;`;
  const languageLinks = (await selectQuery<NotiLink[]>(showDBQuery)).map(
    (language) => language.link,
  );

  for (const notice of lists) {
    if (languageLinks.includes(notice)) continue;

    const result = await noticeContentCrawling(notice);
    if (result.path === '') {
      notificationToSlack(`${notice} 어학 콘텐츠 크롤링 실패`);
      continue;
    }

    const query =
      'INSERT INTO 어학공지 (title, link, upload_date, author, rep_yn, category) VALUES (?,?,?,?,?,?)';
    const values = [
      result.title,
      result.path,
      result.date,
      result.author,
      false,
      'LANGUAGE',
    ];

    await db.execute(query, values);
    newNoticeTitle.push(result.title);
  }

  // await Promise.all(savePromises);
  return newNoticeTitle;
};
