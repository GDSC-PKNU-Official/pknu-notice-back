module.exports = {
  preset: 'ts-jest',
  verbose: true,
  moduleNameMapper: {
    '@apis/(.*)': '<rootDir>/apis/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
