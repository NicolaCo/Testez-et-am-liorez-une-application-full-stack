export interface E2eUser {
  token: string;
  type: string;
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  admin: boolean;
}

export interface SessionStub {
  id?: number;
  name: string;
  description: string;
  date: string;
  teacher_id: number;
  users: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherStub {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountStub {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export const adminUser: E2eUser = {
  token: 'token', type: 'Bearer', id: 1,
  username: 'yoga@studio.com', firstName: 'Admin', lastName: 'User', admin: true,
};

export const simpleUser: E2eUser = {
  token: 'token', type: 'Bearer', id: 2,
  username: 'user@test.com', firstName: 'Test', lastName: 'User', admin: false,
};

export const session: SessionStub = {
  id: 1, name: 'Morning Yoga', description: 'A gentle session',
  date: '2026-09-20T10:00:00Z', teacher_id: 1, users: [],
  createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z',
};

export const teacher: TeacherStub = {
  id: 1, firstName: 'Margot', lastName: 'DELAHAYE',
  createdAt: '2026-01-01T10:00:00.000Z', updatedAt: '2026-01-01T10:00:00.000Z',
};

export const user1: AccountStub = {
  id: 1, email: 'yoga@studio.com', firstName: 'Admin', lastName: 'User',
  admin: true, password: '', createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
};

export const user2: AccountStub = {
  id: 2, email: 'user@test.com', firstName: 'Test', lastName: 'User',
  admin: false, password: '', createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
};