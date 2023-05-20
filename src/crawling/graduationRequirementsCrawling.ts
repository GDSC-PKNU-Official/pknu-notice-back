import axios from 'axios';
import * as cheerio from 'cheerio';

export const graduationRequirementsCrawling = async (
  departmentLink: string,
) => {
  if (departmentLink === undefined) return;
  if (departmentLink.endsWith('/'))
    departmentLink = departmentLink.slice(0, -1);
  const graduationLink: string[] = [];
  const response = await axios.get(departmentLink);
  const $ = cheerio.load(response.data);
  const targetName = '졸업요건';
  const selector = `:contains("${targetName}")`;
  const targetElements = $(selector);

  targetElements.each((index, element) => {
    const link = $(element).attr('href');
    if (link !== undefined) {
      const URL = departmentLink + link;
      console.log(URL);
      graduationLink.push(URL);
    }
  });

  return graduationLink;
};
