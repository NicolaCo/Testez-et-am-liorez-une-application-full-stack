describe('Navigation spec', () => {
  it('should display the Login and Register links in the toolbar when logged out', () => {
    cy.visit('/login');

    cy.get('a.link').should('contain', 'Login');
    cy.get('a.link').should('contain', 'Register');
  });

  it('should redirect the root path to /login', () => {
    cy.visit('/');

    cy.url().should('include', '/login');
  });

  it('should display the 404 page for an unknown route', () => {
    cy.visit('/inexistant');

    cy.get('h1').should('contain', 'Page not found !');
  });

  it('should redirect an unauthenticated user to /login when accessing /me', () => {
    cy.visit('/me');

    cy.url().should('include', '/login');
  });
});