import { HttpClient } from '@angular/common/http';
import { expect } from '@jest/globals';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpClientMock: { get: jest.Mock; delete: jest.Mock };

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      delete: jest.fn()
    };
    service = new UserService(httpClientMock as unknown as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getById() should call GET api/user/:id', () => {
    service.getById('5');

    expect(httpClientMock.get).toHaveBeenCalledWith('api/user/5');
  });

  it('delete() should call DELETE api/user/:id', () => {
    service.delete('5');

    expect(httpClientMock.delete).toHaveBeenCalledWith('api/user/5');
  });
});