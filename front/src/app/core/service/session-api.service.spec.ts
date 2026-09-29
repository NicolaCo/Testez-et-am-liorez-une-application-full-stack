import { HttpClient } from '@angular/common/http';
import { expect } from '@jest/globals';

import { Session } from '../models/session.interface';
import { SessionApiService } from './session-api.service';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpClientMock: { get: jest.Mock; post: jest.Mock; put: jest.Mock; delete: jest.Mock };

  const session: Session = {
    id: 2,
    name: 'Yoga Session',
    description: 'Une session de yoga',
    date: new Date('2026-09-18'),
    teacher_id: 7,
    users: [1, 3]
  };

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
    service = new SessionApiService(httpClientMock as unknown as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('all() should call GET api/session', () => {
    service.all();

    expect(httpClientMock.get).toHaveBeenCalledWith('api/session');
  });

  it('detail() should call GET api/session/:id', () => {
    service.detail('2');

    expect(httpClientMock.get).toHaveBeenCalledWith('api/session/2');
  });

  it('delete() should call DELETE api/session/:id', () => {
    service.delete('2');

    expect(httpClientMock.delete).toHaveBeenCalledWith('api/session/2');
  });

  it('create() should call POST api/session with the session', () => {
    service.create(session);

    expect(httpClientMock.post).toHaveBeenCalledWith('api/session', session);
  });

  it('update() should call PUT api/session/:id with the session', () => {
    service.update('2', session);

    expect(httpClientMock.put).toHaveBeenCalledWith('api/session/2', session);
  });

  it('participate() should call POST api/session/:id/participate/:userId', () => {
    service.participate('2', '3');

    expect(httpClientMock.post).toHaveBeenCalledWith('api/session/2/participate/3', null);
  });

  it('unParticipate() should call DELETE api/session/:id/participate/:userId', () => {
    service.unParticipate('2', '3');

    expect(httpClientMock.delete).toHaveBeenCalledWith('api/session/2/participate/3');
  });
});