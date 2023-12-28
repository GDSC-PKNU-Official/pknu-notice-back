import { collegeCrawling } from '@crawling/collegeCrawling';
import { saveLanguageNoticeToDB } from '@db/data/languageHandler';
import {
  saveDepartmentToDB,
  saveMajorNoticeToDB,
  saveSchoolNoticeToDB,
  saveWhalebeToDB,
} from '@db/data/noticeHandler';
import { recruitHandler } from '@db/data/recruitHandler';
import db from '@db/index';
import createNoticeTable from '@db/table/createTables';
import { RowDataPacket } from 'mysql2';

export const initialCrawling = async () => {
  try {
    const checkInitialQuery = "SHOW TABLES LIKE 'departments';";
    const [rows] = await db.execute<RowDataPacket[]>(checkInitialQuery);
    if (rows.length > 0) return;

    const collegeList = await collegeCrawling();
    await createNoticeTable();
    await saveDepartmentToDB(collegeList);
    await saveLanguageNoticeToDB();
    await recruitHandler();
    // await saveGraduationRequirementToDB();
    await saveSchoolNoticeToDB();
    await saveWhalebeToDB();
    await saveMajorNoticeToDB();
  } catch (err) {
    console.log(err + '최종 에러 캐치');
  }
};
