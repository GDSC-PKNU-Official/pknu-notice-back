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
    db.execute(saveGraduationQuery);
  });

  try {
    await Promise.all(saveGradudationPromises);
  } catch (err) {
    console.log(err);
  }
};
