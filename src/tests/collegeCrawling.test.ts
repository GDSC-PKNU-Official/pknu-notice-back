import { collegeCrawling } from '@crawling/collegeCrawling';

test.skip('단과대학 크롤링 테스트', async () => {
  const collegeList = await collegeCrawling();
  expect(collegeList).toHaveLength(10);
});
