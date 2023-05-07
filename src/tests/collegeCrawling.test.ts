import { collegeCrawling } from '@crawling/collegeCrawling';

describe('단과대학 크롤링 테스트', () => {
  const collegeList = collegeCrawling();
  expect(collegeList).toHaveLength(10);
});
