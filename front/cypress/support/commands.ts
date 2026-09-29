import { adminUser, E2eUser } from '../fixtures/data';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(user?: E2eUser): void;
    }
  }
}

Cypress.Commands.add('login', (user: E2eUser = adminUser): void => {
  cy.intercept('POST', '/api/auth/login', { body: user }).as('login');

  cy.visit('/login');
  cy.get('input[formControlName=email]').type(user.username);
  cy.get('input[formControlName=password]').type('test!1234');
  cy.get('button[type=submit]').click();

  cy.wait('@login');
});