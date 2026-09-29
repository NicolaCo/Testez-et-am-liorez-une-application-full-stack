import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { Session } from '../../../../core/models/session.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';

import { DetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let sessionApiServiceMock: {
    detail: jest.Mock;
    delete: jest.Mock;
    participate: jest.Mock;
    unParticipate: jest.Mock;
  };
  let teacherServiceMock: { detail: jest.Mock };
  let sessionServiceMock: { sessionInformation: SessionInformation };
  let routerMock: { navigate: jest.Mock };
  let matSnackBarSpy: jest.SpyInstance;

  const sessionInformation: SessionInformation = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: true
  };

  const session: Session = {
    id: 1,
    name: 'Yoga matin',
    description: 'Description',
    date: new Date('2026-09-17'),
    teacher_id: 1,
    users: [1],
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-16')
  };

  const teacher: Teacher = {
    id: 1,
    lastName: 'Doe',
    firstName: 'John',
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-16')
  };

  beforeEach(async () => {
    sessionApiServiceMock = {
      detail: jest.fn(),
      delete: jest.fn(),
      participate: jest.fn(),
      unParticipate: jest.fn()
    };
    teacherServiceMock = { detail: jest.fn() };
    sessionServiceMock = { sessionInformation };
    routerMock = { navigate: jest.fn() };

    sessionApiServiceMock.detail.mockReturnValue(of(session));
    sessionApiServiceMock.delete.mockReturnValue(of(undefined));
    sessionApiServiceMock.participate.mockReturnValue(of(undefined));
    sessionApiServiceMock.unParticipate.mockReturnValue(of(undefined));
    teacherServiceMock.detail.mockReturnValue(of(teacher));

    jest.spyOn(window.history, 'back').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [
        DetailComponent,
        RouterTestingModule,
        MatSnackBarModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;

    const matSnackBar = fixture.componentRef.injector.get(MatSnackBar);
    matSnackBarSpy = jest.spyOn(matSnackBar, 'open')
      .mockImplementation(() => undefined as unknown as MatSnackBarRef<TextOnlySnackBar>);

    fixture.detectChanges();
    matSnackBarSpy.mockClear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should read the session id from the route', () => {
      expect(component.sessionId).toBe('1');
    });

    it('should set the user as admin and the user id from the session information', () => {
      expect(component.isAdmin).toBe(true);
      expect(component.userId).toBe('1');
    });

    it('should not set the user as admin when the session information says so', () => {
      sessionServiceMock.sessionInformation = { ...sessionInformation, admin: false };

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;

      expect(component.isAdmin).toBe(false);
    });
  });

  describe('fetchSession via ngOnInit', () => {
    it('should load the session from the API', () => {
      expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');
      expect(component.session).toEqual(session);
    });

    it('should load the teacher associated to the session', () => {
      expect(teacherServiceMock.detail).toHaveBeenCalledWith('1');
      expect(component.teacher).toEqual(teacher);
    });

    it('should mark the user as participant when registered to the session', () => {
      expect(component.isParticipate).toBe(true);
    });

    it('should not mark the user as participant when not registered', () => {
      sessionApiServiceMock.detail.mockReturnValue(of({ ...session, users: [2, 3] }));

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isParticipate).toBe(false);
    });
  });

  describe('back', () => {
    it('should call window.history.back', () => {
      const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => undefined);

      component.back();

      expect(historyBackSpy).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call the API with the session id', () => {
      component.delete().subscribe();

      expect(sessionApiServiceMock.delete).toHaveBeenCalledWith('1');
    });

    it('should open a snackbar and navigate to the sessions list on success', () => {
      component.delete().subscribe();

      expect(matSnackBarSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('onDelete', () => {
    it('should open a snackbar when the deletion fails', () => {
      sessionApiServiceMock.delete.mockReturnValue(throwError(() => new Error('error')));

      component.onDelete();

      expect(matSnackBarSpy).toHaveBeenCalledWith('Unable to delete the session', 'Close', { duration: 3000 });
    });
  });

  describe('participate', () => {
    it('should call the API with the session id and the user id', () => {
      component.participate().subscribe();

      expect(sessionApiServiceMock.participate).toHaveBeenCalledWith('1', '1');
    });

    it('should refresh the session after participating', () => {
      sessionApiServiceMock.detail.mockReturnValue(of({ ...session, users: [2] }));

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(component.isParticipate).toBe(false);
      sessionApiServiceMock.detail.mockClear();

      sessionApiServiceMock.detail.mockReturnValue(of({ ...session, users: [1] }));
      component.participate().subscribe();

      expect(sessionApiServiceMock.detail).toHaveBeenCalled();
      expect(component.isParticipate).toBe(true);
    });
  });

  describe('onParticipate', () => {
    it('should open a snackbar when the participation fails', () => {
      sessionApiServiceMock.participate.mockReturnValue(throwError(() => new Error('error')));

      component.onParticipate();

      expect(matSnackBarSpy).toHaveBeenCalledWith('Unable to participate', 'Close', { duration: 3000 });
    });
  });

  describe('unParticipate', () => {
    it('should call the API with the session id and the user id', () => {
      component.unParticipate().subscribe();

      expect(sessionApiServiceMock.unParticipate).toHaveBeenCalledWith('1', '1');
    });

    it('should refresh the session after withdrawing', () => {
      sessionApiServiceMock.detail.mockClear();

      sessionApiServiceMock.detail.mockReturnValue(of({ ...session, users: [2] }));
      component.unParticipate().subscribe();

      expect(sessionApiServiceMock.detail).toHaveBeenCalled();
      expect(component.isParticipate).toBe(false);
    });
  });

  describe('onUnParticipate', () => {
    it('should open a snackbar when the withdrawal fails', () => {
      sessionApiServiceMock.unParticipate.mockReturnValue(throwError(() => new Error('error')));

      component.onUnParticipate();

      expect(matSnackBarSpy).toHaveBeenCalledWith('Unable to withdraw', 'Close', { duration: 3000 });
    });
  });

  describe('template', () => {
    it('should display the session details', () => {
      const text = fixture.nativeElement.textContent as string;

      expect(text).toContain('Yoga Matin');
      expect(text).toContain('Description');
    });

    it('should show the delete button for an admin', () => {
      expect(fixture.nativeElement.textContent).toContain('Delete');
    });

    it('should show the participate button for a non-admin user', () => {
      sessionServiceMock.sessionInformation = { ...sessionInformation, admin: false };
      sessionApiServiceMock.detail.mockReturnValue(of({ ...session, users: [2] }));

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('Participate');
      expect(text).not.toContain('Delete');
    });

    it('should show the withdraw button for a participant', () => {
      sessionServiceMock.sessionInformation = { ...sessionInformation, admin: false };

      fixture = TestBed.createComponent(DetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Do not participate');
    });
  });
});
