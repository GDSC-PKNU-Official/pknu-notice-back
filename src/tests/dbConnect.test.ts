import db from '@db/index';

jest.mock('mysql2', () => ({
  createConnection: jest.fn(() => ({
    connect: jest.fn((callback) => callback()),
    end: jest.fn((callback) => callback()),
  })),
}));

describe('데이터베이스 연결 테스트', () => {
  // beforeAll((done) => {
  //   db.connect((error) => {
  //     if (error) console.error('MYSQL 연결 실패:', error);
  //   });
  //   done();
  // });

  // afterAll((done) => {
  //   db.end((error) => {
  //     if (error) console.error('MYSQL 연결 종료 실패:', error);
  //     done();
  //   });
  // });

  it('DB 연결 확인', (done) => {
    expect(db).toBeDefined();
    expect(db.connect).toHaveBeenCalled();
    done();
  });
});
