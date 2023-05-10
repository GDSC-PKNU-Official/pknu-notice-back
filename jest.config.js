module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleNameMapper: {
    '@apis/(.*)': '<rootDir>/src/apis/$1',
    '@config/(.*)': '<rootDir>/src/config/$1',
    '@middlewares/(.*)': '<rootDir>/src/middleswares/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
