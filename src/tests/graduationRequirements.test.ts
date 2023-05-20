import { collegeCrawling } from '@crawling/collegeCrawling';
import { departmentListCrawling } from '@crawling/departmentsCrawling';
import { graduationRequirementsCrawling } from '@crawling/graduationRequirementsCrawling';

test.skip('졸업요건 크롤링 테스트', async () => {
  const collegeList = await collegeCrawling();
  collegeList.forEach(async (college) => {
    const departmentsList = await departmentListCrawling(college.collegeLink);
    departmentsList.forEach(async (department) => {
      const result = await graduationRequirementsCrawling(
        department.departmentLink,
      );
      console.log(result);
      if (result.length !== 1) {
        console.log(department.department);
      }
      expect(result).toHaveLength(1);
    });
  });
});
