import axios from 'axios';
import * as cheerio from 'cheerio';
import { College } from 'src/@types/college';
import { Notices } from 'src/@types/college';
import { MAJOR_URL } from 'src/config/crawlingURL';

interface NoticeLists {
  pinnedNotice?: string[];
  normalNotice: string[];
}

const findNoticeLink = (
  targetName: string,
  college: College,
  $: cheerio.Root,
): string => {
  const selector = `:contains("${targetName}")`;
  const targetElements = $(selector);
  let noticeLink = '';
  let flag = true;

  targetElements.each((index, element) => {
    const link = $(element).attr('href');
    if (college.department_name === '유아교육과' && flag) {
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
  if (college.department_subname === '의공학전공') {
    protocol = 'http://';
  } else if (college.department_subname === '공간정보시스템공학전공')
    return MAJOR_URL.spatial_information_system_engineering_notice;
  const response = await axios.get(college.department_link);
  const hostLink = protocol + response.request._redirectable._options.hostname;
  const $ = cheerio.load(response.data);
  const noticeLink = hostLink + findNoticeLink('공지사항', college, $);

  if (noticeLink !== '') return noticeLink;

  return hostLink + findNoticeLink('공지사항(학부)', college, $);
};

export const noticeListCrawling = async (
  link: string,
  inputHostLink?: string,
): Promise<NoticeLists> => {
  const response = await axios.get(link);
  const hostLink =
    'https://' + response.request._redirectable._options.hostname;
  const $ = cheerio.load(response.data);
  let tableData = $('table').find('tbody').find('tr');
  tableData =
    tableData.length > 0
      ? tableData
      : $('ul#board_list, ul.c_glyList').find('li');

  if (tableData.length < 1) {
    const tmp: NoticeLists = {
      normalNotice: [],
    };
    return Promise.reject(tmp);
  }

  let beforeDate: string;
  let flag = true;
  const pinnedNotice: string[] = [];
  const normalNotice: string[] = [];

  if (link === MAJOR_URL.spatial_information_system_engineering_notice) {
    const noticePage2Lists = await noticeListCrawling(link);
    pinnedNotice.push(...noticePage2Lists.pinnedNotice);
    normalNotice.push(...noticePage2Lists.normalNotice);
  }

  tableData.each((index, element) => {
    const anchorElement = $(element).find('a');
    let tmpLink = anchorElement.attr('href');

    if (inputHostLink) tmpLink = inputHostLink + tmpLink;
    else if (tmpLink[0] === '?') tmpLink = link + tmpLink;
    else if (tmpLink[0] === '/') tmpLink = hostLink + tmpLink;

    const findDate = $(element)
      .text()
      .match(/\d{4}[-.]\d{2}[-.]\d{2}/);

    if (
      link.startsWith(MAJOR_URL.spatial_information_system_engineering_notice)
    ) {
      // 공간정보시스템공학과
      if ($(element).find('td').first().text().trim() === '공지')
        pinnedNotice.push(tmpLink);
      else normalNotice.push(tmpLink);
      flag = false;
    } else if (link === MAJOR_URL.biomedical_engineering_notice) {
      // 의공학과
      if ($(element).find('.notice_icon').length > 0)
        pinnedNotice.push(tmpLink);
      else normalNotice.push(tmpLink);
      flag = false;
    } else if (link === MAJOR_URL.visual_design_notice) {
      pinnedNotice.push(tmpLink);
    } else {
      const dateMatch = findDate[0];
      if (index === 0) beforeDate = dateMatch;
      else {
        if (beforeDate < dateMatch) {
          flag = false;
        }
        beforeDate = dateMatch;
      }

      if (flag) {
        pinnedNotice.push(tmpLink);
      } else {
        normalNotice.push(tmpLink);
      }
    }
  });

  if (flag) {
    const noticeLists: NoticeLists = {
      normalNotice: pinnedNotice,
    };
    return noticeLists;
  } else {
    const noticeLists: NoticeLists = {
      pinnedNotice,
      normalNotice,
    };
    return noticeLists;
  }
};

export const noticeContentCrawling = async (link: string): Promise<Notices> => {
  const response = await axios.get(link);
  const $ = cheerio.load(response.data);

  const contentData = $('div#board_view');
  if (contentData.length > 0) {
    const title = contentData.find('h3').first().text().trim();
    const upload_date = contentData.find('p.writer strong').text().trim();
    const description = contentData
      .find('div.board_stance')
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notices = { title, link, upload_date, description };
    return notice;
  }

  const contentData2 = $('article#bo_v');
  if (contentData2.length > 0) {
    const title = contentData2.find('h2#bo_v_title').text().trim();
    const text = contentData2.find('strong.if_date').text().trim();
    const dateMatch = text.match(/(\d{2}-\d{2}-\d{2})/);
    const upload_date = dateMatch ? dateMatch[1] : null;
    const description = contentData2
      .find('div#bo_v_con')
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notices = { title, link, upload_date, description };
    return notice;
  }

  const tables = $('table.a_brdList, table.c_brdView');
  if (tables.length > 0) {
    const title = tables.find('tr').eq(0).text().trim();
    const upload_date = tables
      .find('tr')
      .eq(1)
      .find('td')
      .first()
      .text()
      .trim();
    const description = tables
      .find('tr')
      .eq(3)
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notices = { title, link, upload_date, description };
    return notice;
  }

  const writeTable = $('table.write');
  if (writeTable.length > 0) {
    const title = writeTable.find('tr').first().find('td').text().trim();
    const upload_date = writeTable
      .find('tr')
      .eq(2)
      .find('td')
      .text()
      .trim()
      .split(' ')[0];
    const description = writeTable
      .find('tr')
      .eq(4)
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notices = { title, link, upload_date, description };
    return notice;
  }

  const boardBoxTable = $('div#board_box table');
  if (boardBoxTable.length > 0) {
    const title = boardBoxTable.find('tr p').first().text().trim();
    const upload_date = boardBoxTable.find('tr span').eq(1).text().trim();
    const description = boardBoxTable
      .find('tr')
      .eq(2)
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notices = { title, link, upload_date, description };
    return notice;
  }

  const bdContTable = $('div.bdCont');
  if (bdContTable.length > 0) {
    const title = bdContTable
      .find('tbody')
      .first()
      .find('tr')
      .first()
      .text()
      .trim();
    const upload_date = bdContTable
      .find('tbody')
      .first()
      .find('tr')
      .eq(1)
      .find('td')
      .eq(3)
      .text()
      .trim();
    const description = bdContTable.find('div.bdvTxt_wrap').text().trim();
    const notice: Notices = { title, link, upload_date, description };
    return notice;
  }

  const brdListTable = $('table.brdList').find('tbody').find('tr'); // 채용 공지사항 크롤링으로 upload_date는 모집기간을 가짐 (따로 타입을 만들어서 반환하기 싫기때문)
  if (brdListTable.length > 0) {
    const title = brdListTable.first().find('td').eq(1).text().trim();
    const start_date = brdListTable.eq(2).find('td').eq(1).text().trim();
    const end_date = brdListTable.eq(2).find('td').eq(3).text().trim();
    const upload_date = start_date + ' ~ ' + end_date;
    return { title, link, upload_date, description: '' };
  }

  return { title: '', link: '', upload_date: '', description: '' };
};
