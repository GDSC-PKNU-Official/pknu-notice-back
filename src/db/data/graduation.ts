import { crawlingGraudationLinks } from '@crawling/graduationRequirementsCrawling';

import db from '..';

interface GraduationLink {
  department: string;
  link: string;
}

export const saveGraduationRequirementToDB = async () => {
  const graduationLinks: GraduationLink[] = await crawlingGraudationLinks();
  const saveGradudationPromises = graduationLinks.map((graduationLink) => {
    const saveGraduationQuery = `INSERT INTO graduation (department, link) VALUES ('${graduationLink.department}', '${graduationLink.link}');`;
    return new Promise<void>((resolve, reject) => {
      db.query(saveGraduationQuery, (error) => {
        if (error) {
          console.log('졸업요건 입력 실패', error);
          reject(error);
        } else {
          console.log('졸업요건 입력 성공!');
          resolve();
        }
      });
    });
  });

  try {
    await Promise.all(saveGradudationPromises);
  } catch (err) {
    console.log(err);
  }
};
