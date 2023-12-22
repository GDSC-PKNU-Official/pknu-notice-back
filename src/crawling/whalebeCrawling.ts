import axios from 'axios';
import * as cheerio from 'cheerio';
import { WhalebeData } from 'src/@types/college';
import { PKNU_URL } from 'src/config/crawlingURL';

const sliceURL = (link: string): string => {
  if (link.startsWith('location.href=')) {
    link = link.slice(15);
    link = link.slice(0, -2);
  }

  return link;
};

export const whalebeCrawling = async (): Promise<WhalebeData[]> => {
  const hostname = PKNU_URL.whalebe_homepage;
  const whalebeLink = hostname + '/main';
  const whalebeData: WhalebeData[] = [];

  const response = await axios.get(whalebeLink);
  const $ = cheerio.load(response.data);

  const programs = $('ul.px-0').find('li');
  if (programs.length < 1) return;

  programs.each((_, element) => {
    const imgurl = hostname + $(element).find('img').attr('src');
    const link = hostname + sliceURL($(element).find('div').attr('onclick'));
    const title = $(element).find('.card-title').text().trim();
    const recruitment_period = $(element)
      .find('.app_date')
      .find('.col-12')
      .first()
      .find('span')
      .eq(1)
      .text()
      .trim()
      .replace('&nbsp;', '');
    const operating_period = $(element)
      .find('.app_date')
      .find('.col-12')
      .eq(1)
      .find('span')
      .eq(1)
      .text()
      .trim()
      .replace('&nbsp;', '');

    const tmpData: WhalebeData = {
      title,
      recruitment_period,
      operating_period,
      imgurl,
      link,
    };
    whalebeData.push(tmpData);
  });
  return whalebeData;
};
