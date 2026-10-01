# Yoga

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.16.

## Start the project

Git clone:

> git clone https://github.com/NicolaCo/Testez-et-am-liorez-une-application-full-stack.git

Go inside folder:

> cd Testez-et-am-liorez-une-application-full-stack/front

Install dependencies:

> npm install

Launch Front-end:

> npm run start


### Test

#### E2E

The e2e tests are written with Cypress (specs in `front/cypress/e2e`). All API calls are mocked with `cy.intercept`, so **the back application does not need to be running**.

Launching the e2e tests interactively (opens the Cypress runner with live reloading):

> npm run e2e

Launching the whole e2e suite headless (use this one in CI). This one requires a Chromium or Chrome for Testing binary, automatically looked up in the puppeteer and playwright caches:

> npm run e2e:ci

The browser used by `e2e:ci` is set to `chromium` in `front/angular.json` (target `e2e-ci`, option `browser`) and can be changed to any of the browsers supported by Cypress: `electron`, `chrome`, `chromium`, `canary`, `firefox`, `edge`.

Other Cypress entry points:

> npm run cypress:open
> npm run cypress:run

The coverage report is generated while the e2e tests run, no extra command is needed:

> front/coverage/lcov-report/index.html

Regenerating the coverage report into `front/e2e/coverage` (you should launch e2e tests before):

> npm run e2e:coverage

Report is available here:

> front/e2e/coverage/lcov-report/index.html

#### Unitary test

Launching test:

> npm run test

for following change:

> npm run test:watch

Generate the coverage report:

> npm run test:coverage

Generate coverage and test results reports:

> npm run test:report

Reports are available here:

> front/unit/coverage/lcov-report/index.html
> front/unit/test-report.html

Note:
`npm run test` does not collect coverage. `npm run test:coverage` and `npm run test:report` enforce the global coverage threshold of 80% covered statements and fail below it.
