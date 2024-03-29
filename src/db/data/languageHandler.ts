import {
  noticeContentCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import db from '@db/index';
import { selectQuery } from '@db/query/dbQueryHandler';
import { Notices } from 'src/@types/college';
import { PKNU_URL } from 'src/config/crawlingURL';
import LANGUAGE_AUTHOR from 'src/constants/languageAuthor';
import notificationToSlack from 'src/hooks/notificateToSlack';

interface NotiLink {
  link: string;
}

const saveNotice = async (result: Notices): Promise<boolean> => {
  const query =
    'INSERT INTO notices (title, link, upload_date, author, rep_yn, category) VALUES (?,?,?,?,?,?)';
  const values = [
    result.title,
    result.link,
    result.upload_date,
    result.author ? result.author : '글로벌어학교육센터',
    false,
    'LANGUAGE',
  ];

  if (!LANGUAGE_AUTHOR.includes(result.author)) return true;

  try {
    await db.execute(query, values);
    console.log('어학 공지 입력 성공!');
    return true;
  } catch (error) {
    notificationToSlack(error.message + '어학 공지 입력 실패');
    return false;
  }
};

export const saveLanguageNoticeToDB = async () => {
  const languageNotiLists1 = await noticeListCrawling(
    PKNU_URL.language_notice_exchange_student,
    PKNU_URL.main_homepage_notice,
  );
  const languageNotiLists2 = await noticeListCrawling(
    PKNU_URL.language_notice_language_traning,
    PKNU_URL.main_homepage_notice,
  );

  const lists = [
    ...languageNotiLists1.normalNotice,
    ...languageNotiLists2.normalNotice,
  ];

  if (languageNotiLists1.pinnedNotice)
    lists.push(...languageNotiLists1.pinnedNotice);
  if (languageNotiLists2.pinnedNotice)
    lists.push(...languageNotiLists2.pinnedNotice);

  const newNoticeTitle: string[] = [];

  const showDBQuery = `SELECT link FROM notices WHERE category = 'LANGUAGE';`;
  const languageLinks = (await selectQuery<NotiLink[]>(showDBQuery)).map(
    (language) => language.link,
  );

  for (const notice of lists) {
    if (languageLinks.includes(notice)) continue;

    const result = await noticeContentCrawling(notice);
    if (result.link === '') {
      notificationToSlack(`${notice} 어학 콘텐츠 크롤링 실패`);
      continue;
    }

    const res = await saveNotice(result);
    if (res) newNoticeTitle.push(result.title);
  }

  return newNoticeTitle;
};
