import { sum } from '@apis/index';

test('sum', () => {
  expect(sum(2, 3)).toBe(5);
});
