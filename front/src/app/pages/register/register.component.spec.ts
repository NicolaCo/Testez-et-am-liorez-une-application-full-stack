import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { MessageResponse } from '../../core/models/messageResponse.interface';
import { RegisterRequest } from '../../core/models/registerRequest.interface';
import { AuthService } from '../../core/service/auth.service';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: { register: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  const messageResponse: MessageResponse = {
    message: 'User registered successfully!'
  };

  const validRegistration: RegisterRequest = {
    email: 'john@doe.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'secret'
  };

  beforeEach(async () => {
    authServiceMock = { register: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      imports: [
        RegisterComponent,
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
      component.form.controls['firstName'].setValue('John');
      component.form.controls['lastName'].setValue('Doe');
      component.form.controls['password'].setValue('secret');

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid with a too short first name', () => {
      component.form.controls['email'].setValue('john@doe.com');
      component.form.controls['firstName'].setValue('Jo');
      component.form.controls['lastName'].setValue('Doe');
      component.form.controls['password'].setValue('secret');

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid with a too long last name', () => {
      component.form.controls['email'].setValue('john@doe.com');
      component.form.controls['firstName'].setValue('John');
      component.form.controls['lastName'].setValue('D'.repeat(21));
      component.form.controls['password'].setValue('secret');

      expect(component.form.valid).toBe(false);
    });

    it('should be valid with valid inputs', () => {
      component.form.controls['email'].setValue(validRegistration.email);
      component.form.controls['firstName'].setValue(validRegistration.firstName);
      component.form.controls['lastName'].setValue(validRegistration.lastName);
      component.form.controls['password'].setValue(validRegistration.password);

      expect(component.form.valid).toBe(true);
    });
  });

  describe('submit()', () => {
    it('should call authService.register with the registration data', () => {
      component.form.controls['email'].setValue(validRegistration.email);
      component.form.controls['firstName'].setValue(validRegistration.firstName);
      component.form.controls['lastName'].setValue(validRegistration.lastName);
      component.form.controls['password'].setValue(validRegistration.password);
      authServiceMock.register.mockReturnValue(of(messageResponse));

      component.submit().subscribe();

      expect(authServiceMock.register).toHaveBeenCalledWith(validRegistration);
    });

    it('should navigate to /login on success', () => {
      component.form.controls['email'].setValue(validRegistration.email);
      component.form.controls['firstName'].setValue(validRegistration.firstName);
      component.form.controls['lastName'].setValue(validRegistration.lastName);
      component.form.controls['password'].setValue(validRegistration.password);
      authServiceMock.register.mockReturnValue(of(messageResponse));

      component.submit().subscribe();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.onError).toBe(false);
    });

    it('should set onError to true and not navigate on error', () => {
      component.form.controls['email'].setValue(validRegistration.email);
      component.form.controls['firstName'].setValue(validRegistration.firstName);
      component.form.controls['lastName'].setValue(validRegistration.lastName);
      component.form.controls['password'].setValue(validRegistration.password);
      authServiceMock.register.mockReturnValue(throwError(() => new Error('Bad request')));

      component.submit().subscribe();

      expect(component.onError).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});