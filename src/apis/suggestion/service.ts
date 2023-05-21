import env from '@config/index';
import { Client } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({
  auth: env.NOTION_API_KEY,
});

const getToday = () => {
  const dateObject = new Date();

  const year = dateObject.getFullYear();
  const month = dateObject.getMonth() + 1;
  const date = dateObject.getDate();

  return `${year}-${month >= 10 ? month : '0' + month}-${
    date >= 10 ? date : '0' + date
  }`;
};

const getPostLength = async () => {
  const { results }: QueryDatabaseResponse = await notion.databases.query({
    database_id: env.NOTION_DATABASE_ID,
  });

  return results.length;
};

export const postSuggestion = async (content: string) => {
  const currentLength = await getPostLength();
  const today = getToday();

  const res = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: `부림이 건의사항 #${currentLength}`,
            },
          },
        ],
      },
      Date: {
        date: {
          start: today,
        },
      },
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content,
              },
            },
          ],
        },
      },
    ],
  });

  return res;
};
