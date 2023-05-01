module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleNameMapper: {
    '@apis/(.*)': '<rootDir>/apis/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
