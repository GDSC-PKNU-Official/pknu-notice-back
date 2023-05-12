import axios from 'axios';
import * as cheerio from 'cheerio';

interface College {
  collegeName: string;
  collegeLink: string;
}

export const collegeCrawling = async (): Promise<College[]> => {
  const collegeList: College[] = [];
  const PKNUURL = 'https://www.pknu.ac.kr';
  const response = await axios.get(PKNUURL + '/main/23');
  const $ = cheerio.load(response.data);
  $('.subMenu')
    .find('li')
    .each((i, li) => {
      const collegeName = $(li).text().trim();
      const collegeLink = PKNUURL + $(li).find('a').attr('href');
      collegeList.push({ collegeName, collegeLink });
    });
  console.log(collegeList);
  return collegeList;
};
