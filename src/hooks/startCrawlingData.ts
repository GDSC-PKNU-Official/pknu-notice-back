import { collegeCrawling } from '@crawling/collegeCrawling';
import { saveGraduationRequirementToDB } from '@db/data/graduation';
import { saveLanguageNoticeToDB } from '@db/data/languageHandler';
import {
  saveDepartmentToDB,
  saveMajorNoticeToDB,
  saveSchoolNoticeToDB,
  saveWhalebeToDB,
} from '@db/data/noticeHandler';
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
    // await saveGraduationRequirementToDB();
    saveSchoolNoticeToDB();
    saveWhalebeToDB();
    await saveMajorNoticeToDB();
  } catch (err) {
    console.log(err + '최종 에러 캐치');
  }
};
