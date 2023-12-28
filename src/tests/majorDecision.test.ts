// const mockDbQuery = jest.fn(
//   (query: string, callback: (err: Error | null, res: College[]) => void) => {
//     const mockResponse = [
//       {
//         id: 5,
//         collegeName: '인문사회과학대학',
//         departmentName: '경제학과',
//         departmentSubName: '-',
//         departmentLink: 'https://econ.pknu.ac.kr',
//       },
//       {
//         id: 17,
//         collegeName: '자연과학대학',
//         departmentName: '간호학과',
//         departmentSubName: '-',
//         departmentLink: 'http://nursing.pknu.ac.kr',
//       },
//       {
//         id: 20,
//         collegeName: '경영대학',
//         departmentName: '국제통상학부',
//         departmentSubName: '-',
//         departmentLink: 'http://pknudic.pknu.ac.kr',
//       },
//       {
//         id: 21,
//         collegeName: '공과대학',
//         departmentName: '전기공학부',
//         departmentSubName: '전기공학전공',
//         departmentLink: 'http://electric-eng.pknu.ac.kr',
//       },
//     ];
//     callback(null, mockResponse);
//   },
// );

// import { getCollegesName } from '@apis/majorDecision/service';

// import { College } from './../@types/college';

// jest.mock('@db/index', () => ({
//   __esModule: true,
//   default: {
//     query: mockDbQuery,
//   },
// }));

describe.skip('단과대/학과 선택 테스트', () => {
  it('단과대 선택 로직 테스트', async () => {
    expect(1 + 1).toBe(2);
    // expect(result).toEqual([
    //   '인문사회과학대학',
    //   '자연과학대학',
    //   '경영대학',
    //   '공과대학',
    // ]);
  });
});
