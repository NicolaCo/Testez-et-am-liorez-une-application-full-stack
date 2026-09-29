import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { SessionInformation } from '../core/models/sessionInformation.interface';
import { SessionService } from '../core/service/session.service';

import { customJwtInterceptorFn } from './customJwtInterceptorFn';

class MockSessionService {
  public isLogged = true;
  public sessionInformation: SessionInformation | undefined = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: true
  };
}

describe('customJwtInterceptorFn', () => {
  let sessionServiceMock: MockSessionService;
  let nextMock: jest.Mock;

  const request = new HttpRequest('GET', '/api/session');

  beforeEach(() => {
    sessionServiceMock = new MockSessionService();
    nextMock = jest.fn(() => of({ headers: request.headers } as HttpEvent<unknown>));
  });

  it('should add the Authorization header when the user is logged in', () => {
    runInInjectionContext(createInjector(), () => {
      customJwtInterceptorFn(request, nextMock as unknown as HttpHandlerFn).subscribe();
    });

    const forwarded = nextMock.mock.calls[0][0] as HttpRequest<unknown>;
    expect(forwarded.headers.get('Authorization')).toBe('Bearer jwt-token');
  });

  it('should leave the request unchanged when the user is not logged in', () => {
    sessionServiceMock.isLogged = false;

    runInInjectionContext(createInjector(), () => {
      customJwtInterceptorFn(request, nextMock as unknown as HttpHandlerFn).subscribe();
    });

    const forwarded = nextMock.mock.calls[0][0] as HttpRequest<unknown>;
    expect(forwarded.headers.get('Authorization')).toBeNull();
  });

  function createInjector(): Injector {
    return Injector.create({
      providers: [{ provide: SessionService, useValue: sessionServiceMock }]
    });
  }
});