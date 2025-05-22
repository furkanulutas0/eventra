import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockRequest, mockResponse, mockNext } from '../setup';
import AuthController from '../../controllers/auth/controller';
import { supabase } from '../../utils/supabase';
import bcrypt from 'bcryptjs';

describe('AuthController', () => {
  let authController: AuthController;
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    authController = new AuthController();
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      // Mock request data
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      };

      // Mock Supabase responses
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null })
          }),
          insert: () => ({
            select: () => Promise.resolve({
              data: [{ uuid: 'test-uuid' }],
              error: null
            })
          })
        };
      });

      // Execute the controller method
      await authController.signUp(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User created successfully',
          data: expect.any(Array)
        })
      );
    });

    it('should handle case when email already exists', async () => {
      // Mock request data
      req.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      };

      // Mock Supabase response for existing email
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({ 
              data: [{ email: 'existing@example.com' }], 
              error: null 
            })
          })
        };
      });

      // Mock error handler
      const errorHandler = vi.fn();
      vi.doMock('../../utils/middleware/error.handler', () => errorHandler);

      // Execute the controller method
      await authController.signUp(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });

    it('should handle database error during user creation', async () => {
      // Mock request data
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      };

      // Mock Supabase responses - empty array for email check, then error on insert
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [], error: null })
          }),
          insert: () => ({
            select: () => Promise.resolve({
              data: null,
              error: new Error('Database error')
            })
          })
        };
      });

      // Execute the controller method
      await authController.signUp(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully with correct credentials', async () => {
      // Mock request data
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock user data from database
      const mockUserData = [{
        uuid: 'test-uuid',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test',
        surname: 'User'
      }];

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: mockUserData,
              error: null
            })
          })
        };
      });

      // Mock bcrypt compare to return true (password matches)
      (bcrypt.compare as any).mockResolvedValue(true);

      // Execute the controller method
      await authController.signIn(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        sucess: true,
        message: 'User başarıyla giriş yaptı.',
        data: mockUserData
      });
    });

    it('should handle invalid password', async () => {
      // Mock request data
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock user data from database
      const mockUserData = [{
        uuid: 'test-uuid',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test',
        surname: 'User'
      }];

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: mockUserData,
              error: null
            })
          })
        };
      });

      // Mock bcrypt compare to return false (password doesn't match)
      (bcrypt.compare as any).mockResolvedValue(false);

      // Execute the controller method
      await authController.signIn(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle non-existent user', async () => {
      // Mock request data
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock Supabase response for non-existent user
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: [],
              error: new Error('User not found')
            })
          })
        };
      });

      // Execute the controller method
      await authController.signIn(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      // Execute the controller method
      await authController.signOut(req, res, next);

      // Assertions
      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User signed out'
      });
    });

    it('should handle errors during sign out', async () => {
      // Mock clearCookie to throw error
      res.clearCookie.mockImplementation(() => {
        throw new Error('Cookie clear error');
      });

      // Execute the controller method
      await authController.signOut(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
}); 