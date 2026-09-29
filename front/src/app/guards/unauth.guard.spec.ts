import { expect } from '@jest/globals';
import { Router } from '@angular/router';
import { SessionService } from '../core/service/session.service';

import { UnauthGuard } from './unauth.guard';

describe('UnauthGuard', () => {
  let guard: UnauthGuard;
  let routerMock: { navigate: jest.Mock };
  let sessionServiceMock: { isLogged: boolean };

  beforeEach(() => {
    routerMock = { navigate: jest.fn() };
    sessionServiceMock = { isLogged: false };

    guard = new UnauthGuard(routerMock as unknown as Router, sessionServiceMock as unknown as SessionService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should deny access and redirect to rentals when logged in', () => {
      sessionServiceMock.isLogged = true;

      expect(guard.canActivate()).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['rentals']);
    });

    it('should allow access when not logged in', () => {
      expect(guard.canActivate()).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});