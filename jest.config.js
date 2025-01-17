module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
  setupFiles: ['<rootDir>/test/setup.js'],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'json', 'node'],
  roots: ['<rootDir>', '<rootDir>/test'],
  modulePaths: ['<rootDir>'],
  testEnvironment: 'node'
};
  