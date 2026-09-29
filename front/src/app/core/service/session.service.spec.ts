import { expect } from '@jest/globals';

import { SessionInformation } from '../models/sessionInformation.interface';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  const sessionInformation: SessionInformation = {
    token: 'jwt-token',
    type: 'Bearer',
    id: 1,
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  };

  beforeEach(() => {
    service = new SessionService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should be logged out by default', () => {
      expect(service.isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
    });

    it('$isLogged() should emit false', () => {
      const values: boolean[] = [];
      service.$isLogged().subscribe((value) => values.push(value));

      expect(values).toEqual([false]);
    });
  });

  describe('logIn()', () => {
    it('should set the session information and log the user in', () => {
      service.logIn(sessionInformation);

      expect(service.sessionInformation).toEqual(sessionInformation);
      expect(service.isLogged).toBe(true);
    });

    it('should emit true', () => {
      const values: boolean[] = [];
      service.$isLogged().subscribe((value) => values.push(value));

      service.logIn(sessionInformation);

      expect(values).toEqual([false, true]);
    });
  });

  describe('logOut()', () => {
    it('should clear the session information and log the user out', () => {
      service.logIn(sessionInformation);

      service.logOut();

      expect(service.sessionInformation).toBeUndefined();
      expect(service.isLogged).toBe(false);
    });

    it('should emit false', () => {
      service.logIn(sessionInformation);

      const values: boolean[] = [];
      service.$isLogged().subscribe((value) => values.push(value));

      service.logOut();

      expect(values).toEqual([true, false]);
    });
  });
});