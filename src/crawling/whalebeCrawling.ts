import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WhalebeData {
  title: string;
  date: string;
  imgUrl: string;
  link: string;
}

const sliceURL = (link: string): string => {
  if (link.startsWith('location.href=')) {
    link = link.slice(15);
    link = link.slice(0, -2);
  }

  return link;
};

export const whalebeCrawling = async (): Promise<WhalebeData[]> => {
  const hostname = 'https://whalebe.pknu.ac.kr';
  const whalebeLink = hostname + '/main';
  const whalebeData: WhalebeData[] = [];

  const response = await axios.get(whalebeLink);
  const $ = cheerio.load(response.data);

  const programs = $('ul.px-0').find('li');
  if (programs.length < 1) return;

  programs.each((_, element) => {
    const imgUrl = hostname + $(element).find('img').attr('src');
    const link = hostname + sliceURL($(element).find('div').attr('onclick'));
    const title = $(element).find('.card-title').text().trim();
    const date = $(element)
      .find('.app_date')
      .find('.col-12')
      .first()
      .text()
      .split('~')[1]
      .trim();
    const tmpData = {
      title,
      date,
      imgUrl,
      link,
    };
    whalebeData.push(tmpData);
  });
  return whalebeData;
};
