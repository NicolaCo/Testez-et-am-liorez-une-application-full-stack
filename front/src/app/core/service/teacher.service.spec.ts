import { HttpClient } from '@angular/common/http';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpClientMock: { get: jest.Mock };

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn()
    };
    service = new TeacherService(httpClientMock as unknown as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('all() should call GET api/teacher', () => {
    service.all();

    expect(httpClientMock.get).toHaveBeenCalledWith('api/teacher');
  });

  it('detail() should call GET api/teacher/:id', () => {
    service.detail('7');

    expect(httpClientMock.get).toHaveBeenCalledWith('api/teacher/7');
  });
});