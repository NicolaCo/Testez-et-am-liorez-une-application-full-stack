import { adminUser } from '../fixtures/data';

describe('Authentication spec', () => {
  it('should log in successfully, redirect to /sessions and show the logged-in toolbar', () => {
    cy.intercept('GET', '/api/session', []).as('sessionsList');
    cy.login();

    cy.url().should('include', '/sessions');
    cy.wait('@sessionsList');

    cy.get('span.link').should('contain', 'Sessions');
    cy.get('span.link').should('contain', 'Account');
    cy.get('span.link').should('contain', 'Logout');
  });

  it('should log in by filling the login form, redirect to /sessions and show the logged-in toolbar', () => {
    cy.visit('/login');
    cy.intercept('POST', '/api/auth/login', { body: adminUser }).as('loginRequest');
    cy.intercept('GET', '/api/session', []).as('sessionsList');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/sessions');
    cy.wait('@sessionsList');

    cy.get('span.link').should('contain', 'Sessions');
    cy.get('span.link').should('contain', 'Account');
    cy.get('span.link').should('contain', 'Logout');
  });

  it('should show an error and stay on /login when credentials are invalid', () => {
    cy.visit('/login');
    cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: {} }).as('loginRequest');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('wrong-password');
    cy.get('button[type=submit]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/login');
    cy.get('p.error').should('contain', 'An error occurred');
  });

  it('should enable/disable the submit button based on the form validity', () => {
    cy.visit('/login');

    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').type('invalid-email');
    cy.get('input[formControlName=password]').type('ab');
    cy.get('button[type=submit]').should('be.disabled');

    cy.get('input[formControlName=email]').clear().type('yoga@studio.com');
    cy.get('input[formControlName=password]').clear().type('test!1234');
    cy.get('button[type=submit]').should('be.enabled');
  });

  it('should log the user out, redirect to /login and show the logged-out toolbar', () => {
    cy.intercept('GET', '/api/session', []);
    cy.login();

    cy.get('span.link').contains('Logout').click();

    cy.url().should('include', '/login');
    cy.get('a.link').should('contain', 'Login');
    cy.get('a.link').should('contain', 'Register');
  });

  it('should register a new account and redirect to /login', () => {
    cy.visit('/register');
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: { message: 'User registered successfully!' },
    }).as('registerRequest');

    cy.get('input[formControlName=firstName]').type('firstName');
    cy.get('input[formControlName=lastName]').type('lastName');
    cy.get('input[formControlName=email]').type('new@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest');
    cy.url().should('include', '/login');
  });

  it('should show an error when registration fails', () => {
    cy.visit('/register');
    cy.intercept('POST', '/api/auth/register', { statusCode: 409, body: {} }).as('registerRequest');

    cy.get('input[formControlName=firstName]').type('firstName');
    cy.get('input[formControlName=lastName]').type('lastName');
    cy.get('input[formControlName=email]').type('existing@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest');
    cy.url().should('include', '/register');
    cy.get('span.error').should('contain', 'An error occurred');
  });

  it('should redirect an unauthenticated user to /login when accessing /sessions', () => {
    cy.visit('/sessions');

    cy.url().should('include', '/login');
  });
});