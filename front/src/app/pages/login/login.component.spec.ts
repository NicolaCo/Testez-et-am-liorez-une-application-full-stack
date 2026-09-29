import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { LoginRequest } from '../../core/models/loginRequest.interface';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { AuthService } from 'src/app/core/service/auth.service';
import { SessionService } from 'src/app/core/service/session.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { login: jest.Mock };
  let sessionServiceMock: { logIn: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  const sessionInformation: SessionInformation = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  };

  const validCredentials: LoginRequest = {
    email: 'john@doe.com',
    password: 'secret'
  };

  beforeEach(async () => {
    authServiceMock = { login: jest.fn() };
    sessionServiceMock = { logIn: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      imports: [
        LoginComponent,
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should be invalid with an invalid email', () => {
      component.form.controls['email'].setValue('invalid-email');
      component.form.controls['password'].setValue(validCredentials.password);

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid with a too short password', () => {
      component.form.controls['email'].setValue(validCredentials.email);
      component.form.controls['password'].setValue('ab');

      expect(component.form.valid).toBe(false);
    });

    it('should be valid with valid credentials', () => {
      component.form.controls['email'].setValue(validCredentials.email);
      component.form.controls['password'].setValue(validCredentials.password);

      expect(component.form.valid).toBe(true);
    });
  });

  describe('submit()', () => {
    it('should call authService.login with the credentials', () => {
      component.form.controls['email'].setValue(validCredentials.email);
      component.form.controls['password'].setValue(validCredentials.password);
      authServiceMock.login.mockReturnValue(of(sessionInformation));

      component.submit().subscribe();

      expect(authServiceMock.login).toHaveBeenCalledWith(validCredentials);
    });

    it('should log the user in and navigate to /sessions on success', () => {
      component.form.controls['email'].setValue(validCredentials.email);
      component.form.controls['password'].setValue(validCredentials.password);
      authServiceMock.login.mockReturnValue(of(sessionInformation));

      component.submit().subscribe();

      expect(sessionServiceMock.logIn).toHaveBeenCalledWith(sessionInformation);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBe(false);
    });

    it('should set onError to true and not navigate on error', () => {
      component.form.controls['email'].setValue(validCredentials.email);
      component.form.controls['password'].setValue(validCredentials.password);
      authServiceMock.login.mockReturnValue(throwError(() => new Error('Unauthorized')));

      component.submit().subscribe();

      expect(component.onError).toBe(true);
      expect(sessionServiceMock.logIn).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});