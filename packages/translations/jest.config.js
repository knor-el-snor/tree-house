// jest.config.js
module.exports = {
  verbose: false,
  notify: false,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "json"
  ],
  transform: {
    "\\.(ts|tsx)$": "ts-jest"
  },
  testRegex: "/tests/.*\\.(ts|tsx|js)$",
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/index.ts'
  ],
};
