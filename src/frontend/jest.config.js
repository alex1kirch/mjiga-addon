module.exports = {
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
    "tsx"
  ],
  rootDir: '.',
  testRegex: '.spec.tsx?$',
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'jsdom',
};
