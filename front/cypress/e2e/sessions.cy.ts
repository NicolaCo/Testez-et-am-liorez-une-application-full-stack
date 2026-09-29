import { SessionStub, adminUser, session, simpleUser, teacher } from '../fixtures/data';

describe('Sessions spec', () => {
  it('should display the sessions list as cards for an admin', () => {
    cy.intercept('GET', '/api/session', [{ ...session }]).as('sessionsList');
    cy.login(adminUser);
    cy.wait('@sessionsList');

    cy.get('mat-card.item').should('have.length', 1);
    cy.get('mat-card.item').should('contain', 'Morning Yoga');
  });

  it('should show admin-only Create and Edit buttons for an admin', () => {
    cy.intercept('GET', '/api/session', [{ ...session }]).as('sessionsList');
    cy.login(adminUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Create")').should('be.visible');
    cy.get('button:contains("Edit")').should('be.visible');
    cy.get('button:contains("Detail")').should('be.visible');
  });

  it('should hide admin-only Create and Edit buttons for a non-admin', () => {
    cy.intercept('GET', '/api/session', [{ ...session }]).as('sessionsList');
    cy.login(simpleUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Create")').should('not.exist');
    cy.get('button:contains("Edit")').should('not.exist');
    cy.get('button:contains("Detail")').should('be.visible');
  });

  it('should display the session details and its teacher', () => {
    cy.intercept('GET', '/api/session', [{ ...session }]).as('sessionsList');
    cy.intercept('GET', '/api/session/1', { ...session }).as('sessionDetail');
    cy.intercept('GET', '/api/teacher/1', { ...teacher }).as('teacherDetail');
    cy.login(adminUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Detail")').click();
    cy.wait('@sessionDetail');
    cy.wait('@teacherDetail');

    cy.get('h1').should('contain', 'Morning Yoga');
    cy.get('mat-card-subtitle').should('contain', 'Margot DELAHAYE');
    cy.get('mat-card-content').should('contain', '0 attendees');
    cy.get('button:contains("Delete")').should('be.visible');
  });

  it('should create a session and redirect to the sessions list', () => {
    let sessions: SessionStub[] = [];
    let createdBody: any;
    cy.intercept('GET', '/api/session', (req) => req.reply(sessions)).as('sessionsList');
    cy.intercept('GET', '/api/teacher', [{ ...teacher }]).as('teachers');
    cy.intercept('POST', '/api/session', (req) => {
      createdBody = req.body;
      const created = { ...session, id: 2, name: req.body.name };
      sessions = [created];
      req.reply(created);
    }).as('createSession');
    cy.login(adminUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Create")').click();
    cy.get('h1').should('contain', 'Create session');

    cy.get('input[formControlName=name]').type('Morning Yoga');
    cy.get('input[formControlName=date]').type('2026-09-20');
    cy.get('mat-select').click();
    cy.get('mat-option').contains('Margot DELAHAYE').click();
    cy.get('textarea[formControlName=description]').type('A gentle session');

    cy.get('button[type=submit]').click();
    cy.wait('@createSession')
      .then((interception) => {
        expect(interception.request.body).to.deep.equal({
          name: 'Morning Yoga',
          date: '2026-09-20',
          teacher_id: 1,
          description: 'A gentle session',
        });
      });

    cy.contains('Session created !');
    cy.url().should('include', '/sessions');
    cy.wait('@sessionsList');

    cy.get('mat-card.item').should('have.length', 1);
    cy.get('mat-card.item').should('contain', 'Morning Yoga');
  });

  it('should update a session with a pre-filled form and redirect to the sessions list', () => {
    let sessions: SessionStub[] = [{ ...session }];
    cy.intercept('GET', '/api/session', (req) => req.reply(sessions)).as('sessionsList');
    cy.intercept('GET', '/api/teacher', [{ ...teacher }]).as('teachers');
    cy.intercept('GET', '/api/session/1', { ...session }).as('sessionDetail');
    cy.intercept('PUT', '/api/session/1', (req) => {
      const updated = { ...session, name: req.body.name };
      sessions = [updated];
      req.reply(updated);
    }).as('updateSession');
    cy.login(adminUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Edit")').click();
    cy.wait('@sessionDetail');
    cy.get('h1').should('contain', 'Update session');

    cy.get('input[formControlName=name]').should('have.value', 'Morning Yoga');
    cy.get('input[formControlName=date]').should('have.value', '2026-09-20');
    cy.get('mat-select').should('contain', 'Margot DELAHAYE');
    cy.get('textarea[formControlName=description]').should('have.value', 'A gentle session');

    cy.get('input[formControlName=name]').clear().type('Updated');
    cy.get('button[type=submit]').click();
    cy.wait('@updateSession')
      .then((interception) => {
        expect(interception.request.body).to.deep.equal({
          name: 'Updated',
          date: '2026-09-20',
          teacher_id: 1,
          description: 'A gentle session',
        });
      });

    cy.contains('Session updated !');
    cy.url().should('include', '/sessions');
    cy.wait('@sessionsList');

    cy.get('mat-card.item').should('have.length', 1);
    cy.get('mat-card.item').should('contain', 'Updated');
    cy.get('mat-card.item').should('not.contain', 'Morning Yoga');
  });

  it('should delete a session from its detail page and redirect to the sessions list', () => {
    let sessions: SessionStub[] = [{ ...session }];
    cy.intercept('GET', '/api/session', (req) => req.reply(sessions)).as('sessionsList');
    cy.intercept('GET', '/api/session/1', { ...session }).as('sessionDetail');
    cy.intercept('GET', '/api/teacher/1', { ...teacher }).as('teacherDetail');
    cy.intercept('DELETE', '/api/session/1', (req) => {
      sessions = [];
      req.reply(200);
    }).as('deleteSession');
    cy.login(adminUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Detail")').click();
    cy.wait('@sessionDetail');
    cy.wait('@teacherDetail');

    cy.get('button:contains("Delete")').click();
    cy.wait('@deleteSession');

    cy.contains('Session deleted !');
    cy.url().should('include', '/sessions');
    cy.wait('@sessionsList');

    cy.get('mat-card.item').should('have.length', 0);
  });

  it('should let a non-admin participate in a session', () => {
    cy.intercept('GET', '/api/session', [{ ...session }]).as('sessionsList');
    cy.intercept('GET', '/api/teacher/1', { ...teacher }).as('teacherDetail');
    let detail: SessionStub = { ...session, users: [] };
    cy.intercept('GET', '/api/session/1', (req) => req.reply(detail)).as('sessionDetail');
    cy.intercept('POST', '/api/session/1/participate/2', (req) => {
      detail = { ...session, users: [2] };
      req.reply(200);
    }).as('participate');
    cy.login(simpleUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Detail")').click();
    cy.wait('@sessionDetail');
    cy.get('button:contains("Participate")').should('be.visible');

    cy.get('button:contains("Participate")').click();
    cy.wait('@participate');
    cy.get('button:contains("Do not participate")').should('be.visible');
  });

  it('should let a non-admin withdraw from a session', () => {
    cy.intercept('GET', '/api/session', [{ ...session }]).as('sessionsList');
    cy.intercept('GET', '/api/teacher/1', { ...teacher }).as('teacherDetail');
    let detail: SessionStub = { ...session, users: [2] };
    cy.intercept('GET', '/api/session/1', (req) => req.reply(detail)).as('sessionDetail');
    cy.intercept('DELETE', '/api/session/1/participate/2', (req) => {
      detail = { ...session, users: [] };
      req.reply(200);
    }).as('unparticipate');
    cy.login(simpleUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Detail")').click();
    cy.wait('@sessionDetail');
    cy.get('button:contains("Do not participate")').should('be.visible');

    cy.get('button:contains("Do not participate")').click();
    cy.wait('@unparticipate');
    cy.get('button:contains("Participate")').should('be.visible');
  });

  it('should show an error snackbar when participating fails', () => {
    cy.intercept('GET', '/api/session', [{ ...session }]).as('sessionsList');
    cy.intercept('GET', '/api/teacher/1', { ...teacher }).as('teacherDetail');
    cy.intercept('GET', '/api/session/1', { ...session }).as('sessionDetail');
    cy.intercept('POST', '/api/session/1/participate/2', { statusCode: 500, body: {} }).as('participate');
    cy.login(simpleUser);
    cy.wait('@sessionsList');

    cy.get('button:contains("Detail")').click();
    cy.wait('@sessionDetail');

    cy.get('button:contains("Participate")').click();
    cy.wait('@participate');

    cy.contains('Unable to participate');
    cy.get('button:contains("Participate")').should('be.visible');
  });
});