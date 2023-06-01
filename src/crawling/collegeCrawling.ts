import axios from 'axios';
import * as cheerio from 'cheerio';
import { College } from 'src/@types/college';

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
        if (
          arr[0] !== '학부대학' &&
          arr[0] !== undefined &&
          arr[0] !== '미래융합대학' &&
          arr[2] !== '통계·데이터사이언스전공' &&
          arr[3] !== undefined
        ) {
          if (arr[3].endsWith('/')) arr[3] = arr[3].slice(0, -1);
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
