import axios from 'axios';
import * as cheerio from 'cheerio';

interface DepartmentLists {
  department: string;
  departmentLink: string;
}

export const departmentListCrawling = async (
  college: string,
): Promise<DepartmentLists[]> => {
  const departmentLists: DepartmentLists[] = [];
  const response = await axios.get(college);
  const $ = cheerio.load(response.data);

  $('.con03_sub_1')
    .find('a')
    .each((i, a) => {
      const name = $(a).text().trim();
      const link = $(a).attr('href');

      const department = { department: name, departmentLink: link };
      departmentLists.push(department);
      console.log(department);
    });

  return departmentLists;
};
