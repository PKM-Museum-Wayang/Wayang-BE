jest.mock('./auth.service', () => ({ AuthService: class {} }));

import type { Request } from 'express';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('Sesi admin', () => {
  it('mengembalikan identitas yang telah divalidasi guard', () => {
    const controller = new AuthController({} as AuthService);
    const request = { user: { id: 2, username: 'admin' } } as Request;
    expect(controller.session(request)).toEqual({
      data: { admin: { id: 2, username: 'admin' } },
    });
  });
});
