import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { SessionService } from 'src/app/core/service/session.service';

import { Session } from '../../../../core/models/session.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let sessionApiServiceMock: { all: jest.Mock };
  let sessionServiceMock: { sessionInformation: SessionInformation | undefined };

  const sessionInformation: SessionInformation = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: true
  };

  const sessions: Session[] = [
    { id: 1, name: 'Yoga matin', description: 'Détente', date: new Date('2026-09-15'), teacher_id: 1, users: [1] },
    { id: 2, name: 'Yoga soir', description: 'Relax', date: new Date('2026-09-16'), teacher_id: 2, users: [] }
  ];

  beforeEach(async () => {
    sessionApiServiceMock = { all: jest.fn() };
    sessionServiceMock = { sessionInformation };

    sessionApiServiceMock.all.mockReturnValue(of(sessions));

    await TestBed.configureTestingModule({
      imports: [ListComponent, HttpClientModule, MatCardModule, MatIconModule, RouterTestingModule],
      providers: [
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: SessionService, useValue: sessionServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sessions$', () => {
    it('should emit the sessions returned by the API', () => {
      let received: Session[] | undefined;
      component.sessions$.subscribe((value) => received = value);

      expect(sessionApiServiceMock.all).toHaveBeenCalled();
      expect(received).toEqual(sessions);
    });
  });

  describe('user getter', () => {
    it('should return undefined when the user is not logged in', () => {
      sessionServiceMock.sessionInformation = undefined;

      expect(component.user).toBeUndefined();
    });

    it('should return the session information when logged in', () => {
      expect(component.user).toEqual(sessionInformation);
    });
  });

  describe('template', () => {
    it('should display the sessions', () => {
      const text = fixture.nativeElement.textContent as string;

      expect(text).toContain('Yoga matin');
      expect(text).toContain('Yoga soir');
    });

    it('should show the create button when the user is an admin', () => {
      sessionServiceMock.sessionInformation = { ...sessionInformation, admin: true };
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Create');
    });

    it('should hide the create button when the user is not an admin', () => {
      sessionServiceMock.sessionInformation = { ...sessionInformation, admin: false };
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('Create');
    });
  });
});