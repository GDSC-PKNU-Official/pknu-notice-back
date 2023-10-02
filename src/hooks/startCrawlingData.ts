import { collegeCrawling } from '@crawling/collegeCrawling';
import { saveGraduationRequirementToDB } from '@db/data/graduation';
import {
  saveDepartmentToDB,
  saveNoticeToDB,
  saveSchoolNoticeToDB,
  saveWhalebeToDB,
} from '@db/data/noticeHandler';
import db from '@db/index';
import createNoticeTable from '@db/table/createTables';
import { RowDataPacket } from 'mysql2';

export const initialCrawling = () => {
  try {
    const checkInitialQuery = "SHOW TABLES LIKE 'departments';";
    db.query(checkInitialQuery, async (err, res) => {
      if (err) return;
      const rows = res as RowDataPacket[];
      console.log(rows.length);
      if (rows.length === 0) {
        const collegeList = await collegeCrawling();
        createNoticeTable(collegeList);
        await saveDepartmentToDB(collegeList);
        await saveGraduationRequirementToDB();
        await saveSchoolNoticeToDB();
        await saveWhalebeToDB();
        await saveNoticeToDB();
      }
    });
  } catch (err) {
    console.log(err);
  }
};
