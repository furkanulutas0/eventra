import dotenv from 'dotenv';
import { vi } from 'vitest';
import { Request, Response } from 'express';

// Load environment variables from .env file
dotenv.config();

// Mock Supabase
vi.mock('../utils/supabase', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  };

  return {
    supabase: mockSupabase,
  };
});

// Mock Resend email service
vi.mock('resend', () => {
  const mockResend = {
    emails: {
      send: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  };

  return {
    Resend: vi.fn(() => mockResend),
  };
});

// Mock bcrypt
const mockBcrypt = {
  genSalt: vi.fn().mockResolvedValue('salt'),
  hash: vi.fn().mockResolvedValue('hashedPassword'),
  compare: vi.fn().mockResolvedValue(true),
};

vi.mock('bcryptjs', () => ({
  default: mockBcrypt,
  ...mockBcrypt,
}));

// Global mock for express
vi.mock('express', () => {
  const mockRouter = {
    get: vi.fn().mockReturnThis(),
    post: vi.fn().mockReturnThis(),
    put: vi.fn().mockReturnThis(),
    patch: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    use: vi.fn().mockReturnThis(),
  };

  return {
    Router: vi.fn(() => mockRouter),
    json: vi.fn(),
    urlencoded: vi.fn(),
    static: vi.fn(),
    default: {
      Router: vi.fn(() => mockRouter),
      json: vi.fn(),
      urlencoded: vi.fn(),
      static: vi.fn(),
    },
  };
});

// Mock request and response objects
export const mockRequest = (): Partial<Request> => {
  const req: Partial<Request> = {};
  req.body = {};
  req.params = {};
  req.query = {};
  req.headers = {};
  return req;
};

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  res.sendFile = vi.fn().mockReturnValue(res);
  return res;
};

export const mockNext = vi.fn(); 