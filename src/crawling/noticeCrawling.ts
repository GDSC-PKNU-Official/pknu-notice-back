import axios from 'axios';
import * as cheerio from 'cheerio';
import { College } from 'src/@types/college';
import { Notice } from 'src/@types/college';

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

export const noticeListCrawling = async (
  link: string,
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

  tableData.each((index, element) => {
    const anchorElement = $(element).find('a');
    let tmpLink = anchorElement.attr('href');

    if (tmpLink[0] === '?') tmpLink = link + tmpLink;
    else if (tmpLink[0] === '/') tmpLink = hostLink + tmpLink;

    const findDate = $(element)
      .text()
      .match(/\d{4}[-.]\d{2}[-.]\d{2}/);

    if (link === 'http://geoinfo.pknu.ac.kr/05piazza/08.php') {
      // 공간정보시스템공학과
      if ($(element).find('td').first().text().trim() === '공지')
        pinnedNotice.push(tmpLink);
      else normalNotice.push(tmpLink);
      flag = false;
    } else if (link === 'http://bme.pknu.ac.kr/bbs/board.php?bo_table=notice') {
      // 의공학과
      if ($(element).find('.notice_icon').length > 0)
        pinnedNotice.push(tmpLink);
      else normalNotice.push(tmpLink);
      flag = false;
    } else if (link === 'https://visual.pknu.ac.kr/visual/3674') {
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

export const noticeContentCrawling = async (link: string) => {
  const response = await axios.get(link);
  const $ = cheerio.load(response.data);

  const contentData = $('div#board_view');
  if (contentData.length > 0) {
    const title = contentData.find('h3').first().text().trim();
    const date = contentData.find('p.writer strong').text().trim();
    const description = contentData
      .find('div.board_stance')
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notice = { title, path: link, date, description };
    return notice;
  }

  const contentData2 = $('article#bo_v');
  if (contentData2.length > 0) {
    const title = contentData2.find('h2#bo_v_title').text().trim();
    const text = contentData2.find('strong.if_date').text().trim();
    const dateMatch = text.match(/(\d{2}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : null;
    const description = contentData2
      .find('div#bo_v_con')
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notice = { title, path: link, date, description };
    return notice;
  }

  const tables = $('table.a_brdList, table.c_brdView');
  if (tables.length > 0) {
    const title = tables.find('tr').eq(0).text().trim();
    const date = tables.find('tr').eq(1).find('td').first().text().trim();
    const description = tables
      .find('tr')
      .eq(3)
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notice = { title, path: link, date, description };
    return notice;
  }

  const writeTable = $('table.write');
  if (writeTable.length > 0) {
    const title = writeTable.find('tr').first().find('td').text().trim();
    const date = writeTable
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
    const notice: Notice = { title, path: link, date, description };
    return notice;
  }

  const boardBoxTable = $('div#board_box table');
  if (boardBoxTable.length > 0) {
    const title = boardBoxTable.find('tr p').first().text().trim();
    const date = boardBoxTable.find('tr span').eq(1).text().trim();
    const description = boardBoxTable
      .find('tr')
      .eq(2)
      .text()
      .trim()
      .replace(/\t|\n/g, '');
    const notice: Notice = { title, path: link, date, description };
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
    const date = bdContTable
      .find('tbody')
      .first()
      .find('tr')
      .eq(1)
      .find('td')
      .eq(3)
      .text()
      .trim();
    const description = bdContTable.find('div.bdvTxt_wrap').text().trim();
    const notice: Notice = { title, path: link, date, description };
    return notice;
  }

  console.error('error!!!!');
};
