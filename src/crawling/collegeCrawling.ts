import axios from 'axios';
import * as cheerio from 'cheerio';
import { College } from 'src/@types/college';

import { crawlingGraudationLinks } from './graduationRequirementsCrawling';

const getCollegeData = ($: cheerio.Root, row: cheerio.Element) => {
  const collegeData: string[] = [];
  $(row)
    .find('td')
    .each((idx, res) => {
      if (idx !== 3) {
        collegeData.push($(res).text().trim());
      } else collegeData.push($(res).find('a').attr('href'));
    });

  return collegeData;
};

export const collegeCrawling = async (): Promise<College[]> => {
  const pknuURL = 'https://www.pknu.ac.kr';
  const response = await axios.get(pknuURL + '/main/23');
  const $ = cheerio.load(response.data);
  const collegeTable = $('#user-table');
  const rows = collegeTable.find('tr').toArray();

  const collegeList: College[] = await Promise.all(
    rows.map(async (row) => {
      const collegeData = getCollegeData($, row);

      if (
        collegeData[0] !== undefined &&
        collegeData[3] !== undefined &&
        collegeData[0] !== '학부대학' &&
        collegeData[0] !== '미래융합대학' &&
        collegeData[2] !== '통계·데이터사이언스전공' &&
        !collegeData[1].includes('신설') &&
        !collegeData[2].includes('신설')
      ) {
        if (collegeData[3].endsWith('/'))
          collegeData[3] = collegeData[3].slice(0, -1);

        const gradudationLink = await crawlingGraudationLinks(
          collegeData[1].trim(),
          collegeData[2].trim(),
          collegeData[3].trim(),
        );

        return {
          college_name: collegeData[0],
          department_name: collegeData[1],
          department_subname: collegeData[2],
          department_link: collegeData[3],
          graduation_link: gradudationLink,
        };
      }
    }),
  );

  return collegeList.filter((data) => !!data);
};
