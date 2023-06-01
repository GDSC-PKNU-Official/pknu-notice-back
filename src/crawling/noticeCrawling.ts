import axios from 'axios';
import * as cheerio from 'cheerio';
import { College } from 'src/@types/college';

interface Notice {
  title: string;
  path: string;
  description: string;
  data: string;
}

interface MajorNotice {
  notice: Notice[];
}

const findNoticeLink = (
  targetName: string,
  college: College,
  $: cheerio.CheerioAPI,
): string => {
  const selector = `:contains("${targetName}")`;
  const targetElements = $(selector);
  let noticeLink = '';
  let flag = true;

  targetElements.each((index, element) => {
    const link = $(element).attr('href');
    if (college.departmentName === '유아교육과' && flag) {
      noticeLink = '/education/1553';
      flag = false;
    } else if (link !== undefined && link !== '#none' && flag) {
      noticeLink = link;
      flag = false;
    }
  });

  return noticeLink;
};

export const noticeCrawling = async (college: College): Promise<string> => {
  let protocol = 'https://';
  if (college.departmentSubName === '의공학전공') {
    protocol = 'http://';
  } else if (college.departmentSubName === '공간정보시스템공학전공')
    return 'http://geoinfo.pknu.ac.kr/05piazza/08.php';
  const response = await axios.get(college.departmentLink);
  const hostLink = protocol + response.request._redirectable._options.hostname;
  const $ = cheerio.load(response.data);
  const noticeLink = hostLink + findNoticeLink('공지사항', college, $);

  if (noticeLink !== '') return noticeLink;

  return hostLink + findNoticeLink('공지사항(학부)', college, $);
};
