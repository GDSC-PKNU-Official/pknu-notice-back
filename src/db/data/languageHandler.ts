import {
  noticeContentCrawling,
  noticeListCrawling,
} from '@crawling/noticeCrawling';
import db from '@db/index';
import { RowDataPacket } from 'mysql2';
import { Notice } from 'src/@types/college';
import { PKNU_URL } from 'src/config/crawlingURL';
import notificationToSlack from 'src/hooks/notificateToSlack';

const saveNotice = (notice: Notice): Promise<void> => {
  const query = 'INSERT INTO 어학공지 (title, link, uploadDate) VALUES (?,?,?)';
  const values = [notice.title, notice.path, notice.date];

  return new Promise((resolve) => {
    db.query(query, values, (err) => {
      if (err) {
        console.log('어학 공지사항 입력 실패');
        resolve();
        return;
      }
      console.log('어학 공지사항 입력 성공');
      resolve();
    });
  });
};

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

  const savePromises: Promise<void>[] = [];
  const newNoticeTitle: string[] = [];

  const showDBQuery = `SELECT link FROM 어학공지;`;
  db.query(showDBQuery, async (err, res) => {
    if (err) {
      await notificationToSlack('어학공지 조회 실패');
      return;
    }
    const rows = res as RowDataPacket[];
    let languageNoti: string[] = [];

    if (Array.isArray(rows) && rows.length > 0)
      languageNoti = rows.map((row) => row.link);

    for (const notice of lists) {
      const result = await noticeContentCrawling(notice);
      if (result.path === '') {
        notificationToSlack(`${notice} 어학 콘텐츠 크롤링 실패`);
        continue;
      }

      if (!languageNoti.includes(result.path)) {
        savePromises.push(saveNotice(result));
        newNoticeTitle.push(result.title);
      }
    }

    await Promise.all(savePromises);
    return newNoticeTitle;
  });
};
