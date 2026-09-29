import { adminUser, simpleUser, user1, user2 } from '../fixtures/data';

describe('Account spec', () => {
  const openAccountPage = (user: typeof adminUser, stub: object, alias: string): void => {
    cy.intercept('GET', `/api/user/${user.id}`, stub).as(alias);
    cy.login(user);
    cy.get('span.link').contains('Account').click();
    cy.wait(`@${alias}`);
  };

  it('should display the name and email of a non-admin user', () => {
    openAccountPage(simpleUser, { ...user2 }, 'userDetail');

    cy.get('p').contains('Name:').should('contain', 'Test USER');
    cy.get('p').contains('Email:').should('contain', 'user@test.com');
  });

  it('should display the "You are admin" banner for an admin', () => {
    openAccountPage(adminUser, { ...user1 }, 'userDetail');

    cy.get('p').contains('You are admin').should('be.visible');
  });

  it('should delete the account of a non-admin and redirect to /login', () => {
    cy.intercept('GET', '/api/user/2', { ...user2 }).as('userDetail');
    cy.intercept('DELETE', '/api/user/2', {}).as('deleteUser');
    cy.login(simpleUser);
    cy.get('span.link').contains('Account').click();
    cy.wait('@userDetail');

    cy.get('button:contains("Detail")').click();
    cy.wait('@deleteUser');

    cy.contains('Your account has been deleted !');
    cy.url().should('include', '/login');
    cy.get('a.link').should('contain', 'Login');
    cy.get('span.link').should('not.exist');
  });

  it('should hide the delete button for an admin', () => {
    openAccountPage(adminUser, { ...user1 }, 'userDetail');

    cy.get('p').contains('Delete my account:').should('not.exist');
    cy.get('button:contains("Detail")').should('not.exist');
  });
});