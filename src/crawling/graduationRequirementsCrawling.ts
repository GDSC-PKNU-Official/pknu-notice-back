import db from '@db/index';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { College } from 'src/@types/college';
import {
  DOMAIN_TO_CMS_DEPARTMENTS,
  EXCEPTIONAL_GRADUATION_KEYWORDS,
  EXCEPTIONAL_GRADUATION_LINKS,
  EXCEPTIONAL_SEARCH_KEYWORDS,
  GRADUATION_IN_ARCHIVE,
  GRADUATION_IN_NOTICE_A,
  GRADUATION_IN_NOTICE_B,
} from 'src/constants/graduation';

interface DepartmentItem {
  departmentName: string;
  departmentLink: string;
}
// 졸업요건 크롤링 키워드 관련 예외처리를 위한 함수
const targetKeywordHandler = (departmentName: string) => {
  const originKeyword = '졸업요건';
  if (!Object.keys(EXCEPTIONAL_GRADUATION_KEYWORDS).includes(departmentName)) {
    return originKeyword;
  }
  return EXCEPTIONAL_GRADUATION_KEYWORDS[departmentName];
};
// 졸업요건을 찾기 위한 페이지 키워드 관련 예외 처리를 위한 함수
const searchKeywordHandler = (departmentName: string) => {
  const originKeyword = '공지사항';
  if (!Object.keys(EXCEPTIONAL_SEARCH_KEYWORDS).includes(departmentName)) {
    return originKeyword;
  }
  return EXCEPTIONAL_SEARCH_KEYWORDS[departmentName];
};
// 도메인관련 예외처리를 위한 함수
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
// 졸업요건 크롤링을 공지사항 페이지에서 해야 하는 학과를 처리하기 위한 함수
const noticeLinkHandler = async (
  departmentName: string,
  departmentLink: string,
) => {
  const response = await axios.get(departmentLink);
  const $ = cheerio.load(response.data);

  const targetName = searchKeywordHandler(departmentName);
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
// 졸업요건 크롤링을 시작하는 페이지를 링크를 처리하기 위한 함수
const graduationLinkHandler = async (
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
    const noticeLink = await noticeLinkHandler(departmentName, departmentLink);
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
  const noticeLink = await noticeLinkHandler(departmentName, departmentLink);
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
  return noticeLink + additionalLink_B_1;
};
// 졸업요건 크롤링 함수(=~ main 함수)
const graduationRequirementsCrawling = async (
  departmentName: string,
  departmentLink: string,
): Promise<GraduationLink> => {
  if (departmentLink === undefined) return;
  if (departmentLink.endsWith('/')) {
    departmentLink = departmentLink.slice(0, -1);
  }
  if (Object.keys(EXCEPTIONAL_GRADUATION_LINKS).includes(departmentName)) {
    return {
      department: departmentName,
      link: EXCEPTIONAL_GRADUATION_LINKS[departmentName],
    };
  }
  departmentLink = await graduationLinkHandler(departmentName, departmentLink);

  const response = await axios.get(departmentLink);
  const $ = cheerio.load(response.data);

  const targetName = targetKeywordHandler(departmentName);
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

  return {
    department: departmentName,
    link: graduationLink,
  };
};

const getDepartmentLinks = async () => {
  const SELECT_QUERY = 'SELECT * FROM departments;';
  try {
    const departmentLinks: DepartmentItem[] = [];
    const queryResult = await new Promise<College[]>((resolve, reject) => {
      db.query(SELECT_QUERY, (error, results) => {
        if (error) {
          console.error('SELECT 오류:', error);
          reject(error);
        } else {
          resolve(results as College[]);
        }
      });
    });

    queryResult.forEach((result) => {
      departmentLinks.push({
        departmentName:
          result.departmentSubName === '-'
            ? result.departmentName
            : result.departmentSubName,
        departmentLink: result.departmentLink,
      });
    });
    return departmentLinks;
  } catch (error) {
    console.error('에러 발생:', error);
  }
};

interface GraduationLink {
  department: string;
  link: string;
}

export const crawlingGraudationLinks = async () => {
  const departmentItems = await getDepartmentLinks();
  const graduationLinks: GraduationLink[] = [];

  for (const departmentItem of departmentItems) {
    const { departmentName, departmentLink } = departmentItem;
    const graduationItem: GraduationLink = await graduationRequirementsCrawling(
      departmentName,
      departmentLink,
    );

    graduationLinks.push(graduationItem);
  }

  return graduationLinks;
};
