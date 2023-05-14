import { graduationRequirements } from '@crawling/graduation';

test('졸업요건 크롤링 테스트', () => {
  const graduationRequirementsList: string[] = graduationRequirements();
  graduationRequirementsList.forEach((element) => {
    expect(element).toMatch(/http:\/\//);
  });
});
