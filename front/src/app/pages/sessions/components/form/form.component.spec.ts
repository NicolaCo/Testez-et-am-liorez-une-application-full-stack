import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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

import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiServiceMock: {
    create: jest.Mock;
    update: jest.Mock;
    detail: jest.Mock;
  };
  let teacherServiceMock: { all: jest.Mock };
  let sessionServiceMock: { sessionInformation: SessionInformation };
  let routerMock: { url: string; navigate: jest.Mock };
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
    name: 'Yoga avancé',
    description: 'Une séance de yoga avancé',
    date: new Date('2026-09-17'),
    teacher_id: 5,
    users: [1],
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-16')
  };

  const teacher: Teacher = {
    id: 5,
    lastName: 'Doe',
    firstName: 'John',
    createdAt: new Date('2026-09-15'),
    updatedAt: new Date('2026-09-16')
  };

  const activatedRouteMock = {
    snapshot: { paramMap: { get: () => '1' } }
  };

  function createComponent(): void {
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;

    matSnackBarSpy = jest.spyOn(fixture.componentRef.injector.get(MatSnackBar), 'open')
      .mockImplementation(() => undefined as unknown as MatSnackBarRef<TextOnlySnackBar>);

    fixture.detectChanges();
    matSnackBarSpy.mockClear();
  }

  beforeEach(async () => {
    sessionApiServiceMock = {
      create: jest.fn(),
      update: jest.fn(),
      detail: jest.fn()
    };
    teacherServiceMock = { all: jest.fn() };
    sessionServiceMock = { sessionInformation };
    routerMock = { url: '/sessions/create', navigate: jest.fn() };

    sessionApiServiceMock.create.mockReturnValue(of(undefined));
    sessionApiServiceMock.update.mockReturnValue(of(undefined));
    sessionApiServiceMock.detail.mockReturnValue(of(session));
    teacherServiceMock.all.mockReturnValue(of([teacher]));

    await TestBed.configureTestingModule({
      imports: [
        FormComponent,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: SessionApiService, useValue: sessionApiServiceMock },
        { provide: TeacherService, useValue: teacherServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
      .compileComponents();
  });

  it('should create', () => {
    createComponent();

    expect(component).toBeTruthy();
  });

  describe('teachers list', () => {
    it('should load the teachers on init', () => {
      createComponent();

      let received: Teacher[] | undefined;
      component.teachers$.subscribe((list) => received = list);

      expect(teacherServiceMock.all).toHaveBeenCalled();
      expect(received).toEqual([teacher]);
    });
  });

  describe('ngOnInit', () => {
    it('should initialise an empty form in create mode', () => {
      createComponent();

      expect(component.onUpdate).toBe(false);
      expect(component.sessionForm).toBeDefined();
      expect(component.sessionForm?.get('name')?.value).toBe('');
      expect(component.sessionForm?.get('date')?.value).toBe('');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe('');
      expect(component.sessionForm?.get('description')?.value).toBe('');
    });

    it('should redirect to the sessions list when the user is not an admin', () => {
      sessionServiceMock.sessionInformation = { ...sessionInformation, admin: false };

      createComponent();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
    });

    it('should initialise the form with the session data in update mode', () => {
      routerMock.url = '/sessions/update/1';

      createComponent();

      expect(component.onUpdate).toBe(true);
      expect(sessionApiServiceMock.detail).toHaveBeenCalledWith('1');
      expect(component.sessionForm?.get('name')?.value).toBe(session.name);
      expect(component.sessionForm?.get('date')?.value).toBe('2026-09-17');
      expect(component.sessionForm?.get('teacher_id')?.value).toBe(session.teacher_id);
      expect(component.sessionForm?.get('description')?.value).toBe(session.description);
    });
  });

  describe('submit', () => {
    it('should create the session with the form values', () => {
      createComponent();

      const values = { name: 'Yoga du soir', date: '2026-09-15', teacher_id: 5, description: 'Détente' };
      component.sessionForm?.patchValue(values);

      component.submit().subscribe();

      expect(sessionApiServiceMock.create).toHaveBeenCalledWith(values);
    });

    it('should open a snackbar and navigate after creating the session', () => {
      createComponent();

      component.sessionForm?.patchValue({
        name: 'Yoga du soir',
        date: '2026-09-15',
        teacher_id: 5,
        description: 'Détente'
      });

      component.submit().subscribe();

      expect(matSnackBarSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });

    it('should update the session with the form values', () => {
      routerMock.url = '/sessions/update/1';

      createComponent();

      component.sessionForm?.patchValue({ name: 'Yoga expert' });

      component.submit().subscribe();

      expect(sessionApiServiceMock.update).toHaveBeenCalledWith('1', {
        name: 'Yoga expert',
        date: '2026-09-17',
        teacher_id: 5,
        description: session.description
      });
    });

    it('should open a snackbar and navigate after updating the session', () => {
      routerMock.url = '/sessions/update/1';

      createComponent();

      component.submit().subscribe();

      expect(matSnackBarSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
      expect(routerMock.navigate).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('onSubmit', () => {
    it('should open a snackbar when saving fails', () => {
      sessionApiServiceMock.create.mockReturnValue(throwError(() => new Error('error')));

      createComponent();

      component.onSubmit();

      expect(matSnackBarSpy).toHaveBeenCalledWith('Unable to save the session', 'Close', { duration: 3000 });
    });
  });

  describe('template', () => {
    it('should display the create session title in create mode', () => {
      createComponent();

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('Create session');
      expect(text).not.toContain('Update session');
    });

    it('should display the update session title in update mode', () => {
      routerMock.url = '/sessions/update/1';

      createComponent();

      expect(fixture.nativeElement.textContent).toContain('Update session');
    });

    it('should display the teacher select', () => {
      createComponent();

      expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
    });

    it('should disable the save button while the form is invalid', () => {
      createComponent();

      const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it('should enable the save button when the form is valid', () => {
      createComponent();

      component.sessionForm?.patchValue({
        name: 'Yoga du soir',
        date: '2026-09-15',
        teacher_id: 5,
        description: 'Détente'
      });
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(button.disabled).toBe(false);
    });
  });
});