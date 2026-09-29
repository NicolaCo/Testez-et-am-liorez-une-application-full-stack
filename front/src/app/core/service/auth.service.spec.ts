import { HttpClient } from '@angular/common/http';
import { expect } from '@jest/globals';

import { LoginRequest } from '../models/loginRequest.interface';
import { RegisterRequest } from '../models/registerRequest.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpClientMock: { post: jest.Mock };

  const registerRequest: RegisterRequest = {
    email: 'jdoe@yoga.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password'
  };

  const loginRequest: LoginRequest = {
    email: 'jdoe@yoga.com',
    password: 'password'
  };

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn()
    };
    service = new AuthService(httpClientMock as unknown as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register() should call POST /api/auth/register with the register request', () => {
    service.register(registerRequest);

    expect(httpClientMock.post).toHaveBeenCalledWith('/api/auth/register', registerRequest);
  });

  it('login() should call POST /api/auth/login with the login request', () => {
    service.login(loginRequest);

    expect(httpClientMock.post).toHaveBeenCalledWith('/api/auth/login', loginRequest);
  });
});