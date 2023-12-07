import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  DOMAIN_TO_CMS_DEPARTMENTS,
  EXCEPTIONAL_GRADUATION_KEYWORDS,
  EXCEPTIONAL_GRADUATION_LINKS,
  EXCEPTIONAL_NOTICE_PAGE_KEYWORDS,
  GRADUATION_IN_ARCHIVE,
  GRADUATION_IN_NOTICE_A,
  GRADUATION_IN_NOTICE_B,
} from 'src/constants/graduation';

const handleSearchKeyword = (departmentName: string) => {
  const originKeyword = '졸업요건';
  if (!Object.keys(EXCEPTIONAL_GRADUATION_KEYWORDS).includes(departmentName)) {
    return originKeyword;
  }
  return EXCEPTIONAL_GRADUATION_KEYWORDS[departmentName];
};

const handleNoticePageKeyword = (departmentName: string) => {
  const originKeyword = '공지사항';
  if (!Object.keys(EXCEPTIONAL_NOTICE_PAGE_KEYWORDS).includes(departmentName)) {
    return originKeyword;
  }
  return EXCEPTIONAL_NOTICE_PAGE_KEYWORDS[departmentName];
};

const graduationDomainHandler = (
  departmentName: string,
  departmentLink: string,
  graduationLink: string,
) => {
  if (
    !DOMAIN_TO_CMS_DEPARTMENTS.includes(departmentName) &&
    !Object.keys(GRADUATION_IN_NOTICE_A).includes(departmentName) &&
    !GRADUATION_IN_NOTICE_B.includes(departmentName) &&
    departmentName !== '식품공학전공'
  ) {
    return departmentLink + graduationLink;
  }
  if (DOMAIN_TO_CMS_DEPARTMENTS.includes(departmentName)) {
    const domainTarget = departmentLink.split('//')[1].split('.')[0];
    return departmentLink.replace(domainTarget, 'cms') + graduationLink;
  }
  if (Object.keys(GRADUATION_IN_NOTICE_A).includes(departmentName)) {
    return 'https://cms.pknu.ac.kr' + graduationLink;
  }
  if (departmentName === '식품공학전공') {
    return departmentLink.replace('/view.do?no=405', '') + graduationLink;
  }
  return departmentLink.split('?')[0] + graduationLink;
};

const handleNoticePageLink = async (
  departmentName: string,
  departmentLink: string,
) => {
  const response = await axios.get(departmentLink);
  const $ = cheerio.load(response.data);

  const targetName = handleNoticePageKeyword(departmentName);
  const selector = `:contains("${targetName}")`;
  const targetElements = $(selector);

  let noticeLink: string;
  targetElements.each((index, element) => {
    const link = $(element).attr('href');
    if (link !== undefined) {
      noticeLink = departmentLink + link;
      return false;
    }
  });

  return noticeLink;
};

const handleGraduactionRequirementPage = async (
  departmentName: string,
  departmentLink: string,
) => {
  if (departmentLink.endsWith('/'))
    departmentLink = departmentLink.slice(0, -1);

  if (
    !GRADUATION_IN_ARCHIVE.includes(departmentName) &&
    !Object.keys(GRADUATION_IN_NOTICE_A).includes(departmentName) &&
    !GRADUATION_IN_NOTICE_B.includes(departmentName)
  ) {
    return departmentLink;
  }

  if (GRADUATION_IN_ARCHIVE.includes(departmentName)) {
    const response = await axios.get(departmentLink);
    const $ = cheerio.load(response.data);
    const targetName = '자료실';
    const selector = `:contains("${targetName}")`;
    const targetElements = $(selector);

    let archiveLink: string;
    targetElements.each((index, element) => {
      const link = $(element).attr('href');
      if (link !== undefined) {
        archiveLink = departmentLink + link;
        return false;
      }
    });
    return archiveLink;
  }

  const additionalLink_A = '&pageIndex=1&view=list&sv=TITLE&sw=졸업요건';
  if (Object.keys(GRADUATION_IN_NOTICE_A).includes(departmentName)) {
    const noticeLink = await handleNoticePageLink(
      departmentName,
      departmentLink,
    );

    if (departmentName !== '재료공학전공') {
      return (
        noticeLink.replace(GRADUATION_IN_NOTICE_A[departmentName], 'cms') +
        additionalLink_A
      );
    }

    return (
      noticeLink.replace(GRADUATION_IN_NOTICE_A[departmentName], '') +
      additionalLink_A
    );
  }

  const additionalLink_B_1 =
    '?pageIndex=1&searchCondition=title&searchKeyword=졸업요건';
  const additionalLink_B_2 =
    '?pageIndex=1&searchCondition=title&searchKeyword=졸업+요건';
  const additionalLink_B_3 =
    '?pageIndex=1&searchCondition=title&searchKeyword=졸업';
  const noticeLink = await handleNoticePageLink(departmentName, departmentLink);

  if (departmentName === '수산생명의학과') {
    return noticeLink.replace('4208', '4229') + additionalLink_B_1;
  } else if (
    departmentName === '기술·데이터공학전공' ||
    departmentName === '산업경영공학전공'
  ) {
    return noticeLink.replace('1849', '721') + additionalLink_B_1;
  } else if (departmentName === '양식응용생명과학전공') {
    return noticeLink + additionalLink_B_2;
  }

  if (departmentName === '해양수산경영학전공') {
    return noticeLink + additionalLink_B_3;
  }

  return noticeLink + additionalLink_B_1;
};

const graduationRequirementsCrawling = async (
  departmentName: string,
  departmentLink: string,
): Promise<string> => {
  if (departmentLink.endsWith('/')) {
    departmentLink = departmentLink.slice(0, -1);
  }
  if (Object.keys(EXCEPTIONAL_GRADUATION_LINKS).includes(departmentName)) {
    return EXCEPTIONAL_GRADUATION_LINKS[departmentName];
  }

  departmentLink = await handleGraduactionRequirementPage(
    departmentName,
    departmentLink,
  );

  const response = await axios.get(departmentLink);
  const $ = cheerio.load(response.data);

  const targetName = handleSearchKeyword(departmentName);
  const selector = `:contains("${targetName}")`;
  const targetElements = $(selector);

  let graduationLink = '';
  targetElements.each((index, element) => {
    const link = $(element).attr('href');
    if (link !== undefined) {
      const URL = graduationDomainHandler(departmentName, departmentLink, link);
      graduationLink = URL;
      return false;
    }
  });

  return graduationLink;
};

export const crawlingGraudationLinks = async (
  department_name: string,
  department_subname: string,
  department_link: string,
) => {
  const departmentName =
    department_subname === '-' ? department_name : department_subname;
  const departmentLink = department_link;

  const graudationRequirementLink: string =
    await graduationRequirementsCrawling(departmentName, departmentLink);

  return graudationRequirementLink;
};
