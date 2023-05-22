import axios from 'axios';
import * as cheerio from 'cheerio';

interface College {
  collegeName: string;
  departmentName: string;
  departmentSubName: string;
  departmentLink: string;
}

export const collegeCrawling = async (): Promise<College[]> => {
  const collegeList: College[] = [];
  const pknuURL = 'https://www.pknu.ac.kr';
  const response = await axios.get(pknuURL + '/main/23');
  const $ = cheerio.load(response.data);

  const collegeTable = $('#user-table');
  collegeTable.each((_, element) => {
    $(element)
      .find('tr')
      .each((_, row) => {
        const arr: string[] = [];
        $(row)
          .find('td')
          .each((idx, res) => {
            if (idx !== 3) {
              arr.push($(res).text().trim());
            } else arr.push($(res).find('a').attr('href'));
          });
        if (arr[0] !== '학부대학' && arr[0] !== undefined) {
          const tmpList = {
            collegeName: arr[0],
            departmentName: arr[1],
            departmentSubName: arr[2],
            departmentLink: arr[3],
          };
          collegeList.push(tmpList);
        }
      });
  });
  return collegeList;
};
