import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { SessionService } from 'src/app/core/service/session.service';
import { User } from '../../core/models/user.interface';
import { UserService } from '../../core/service/user.service';
import { MeComponent } from './me.component';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let userServiceMock: { getById: jest.Mock; delete: jest.Mock };
  let sessionServiceMock: { sessionInformation: { id: number }; logOut: jest.Mock };
  let routerMock: { navigate: jest.Mock };
  let matSnackBarOpenSpy: jest.SpyInstance;

  const user: User = {
    id: 1,
    email: 'john@doe.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    password: 'hidden',
    createdAt: new Date('2024-01-01')
  };

  beforeEach(async () => {
    userServiceMock = { getById: jest.fn(), delete: jest.fn() };
    sessionServiceMock = { sessionInformation: { id: 1 }, logOut: jest.fn() };
    routerMock = { navigate: jest.fn() };

    userServiceMock.getById.mockReturnValue(of(user));

    await TestBed.configureTestingModule({
      imports: [
        MeComponent,
        MatSnackBarModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock }
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;

    matSnackBarOpenSpy = jest
      .spyOn((component as unknown as { matSnackBar: MatSnackBar }).matSnackBar, 'open')
      .mockImplementation(() => ({} as never));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should load the current user', () => {
      expect(userServiceMock.getById).toHaveBeenCalledWith('1');
      expect(component.user).toEqual(user);
    });
  });

  describe('delete()', () => {
    it('should delete the user, show a confirmation and log out on success', () => {
      userServiceMock.delete.mockReturnValue(of(undefined));
      matSnackBarOpenSpy.mockClear();

      component.delete().subscribe();

      expect(userServiceMock.delete).toHaveBeenCalledWith('1');
      expect(matSnackBarOpenSpy).toHaveBeenCalledWith(
        'Your account has been deleted !',
        'Close',
        { duration: 3000 }
      );
      expect(sessionServiceMock.logOut).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('onDelete()', () => {
    it('should show an error message when deletion fails', () => {
      userServiceMock.delete.mockReturnValue(throwError(() => new Error('Error')));
      matSnackBarOpenSpy.mockClear();

      component.onDelete();

      expect(matSnackBarOpenSpy).toHaveBeenCalledWith(
        'Unable to delete your account',
        'Close',
        { duration: 3000 }
      );
    });
  });

  describe('back()', () => {
    it('should call window.history.back', () => {
      const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});

      component.back();

      expect(historyBackSpy).toHaveBeenCalled();
      historyBackSpy.mockRestore();
    });
  });
});