import { expect } from '@jest/globals';
import { Router } from '@angular/router';
import { SessionService } from '../core/service/session.service';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerMock: { navigate: jest.Mock };
  let sessionServiceMock: { isLogged: boolean };

  beforeEach(() => {
    routerMock = { navigate: jest.fn() };
    sessionServiceMock = { isLogged: true };

    guard = new AuthGuard(routerMock as unknown as Router, sessionServiceMock as unknown as SessionService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should deny access and redirect to login when not logged in', () => {
      sessionServiceMock.isLogged = false;

      expect(guard.canActivate()).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['login']);
    });

    it('should allow access when logged in', () => {
      expect(guard.canActivate()).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});