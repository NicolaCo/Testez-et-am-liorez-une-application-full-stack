module.exports = {
  ...require('./jest.config'),
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Unit Test Report',
        outputPath: 'unit/test-report.html',
      },
    ],
  ],
};