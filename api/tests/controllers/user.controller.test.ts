import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockRequest, mockResponse, mockNext } from '../setup';
import { UserController } from '../../controllers/user/controller';
import { supabase } from '../../utils/supabase';

describe('UserController', () => {
  let userController: UserController;
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    userController = new UserController();
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserDataById', () => {
    it('should retrieve user data successfully', async () => {
      // Mock request data
      req.query = {
        uuid: 'test-user-id'
      };

      // Mock user data
      const mockUserData = [
        {
          uuid: 'test-user-id',
          email: 'test@example.com',
          name: 'Test',
          surname: 'User'
        }
      ];

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

      // Execute the controller method
      await userController.getUserDataById(req, res, next);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUserData);
    });

    it('should handle error when user is not found', async () => {
      // Mock request data
      req.query = {
        uuid: 'nonexistent-user-id'
      };

      // Mock Supabase response
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: null,
              error: new Error('User not found')
            })
          })
        };
      });

      // Execute the controller method
      await userController.getUserDataById(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      // Mock request data
      req.query = {
        uuid: 'test-user-id'
      };

      // Mock Supabase response with error
      (supabase.from as any).mockImplementation((table) => {
        expect(table).toBe('users');
        return {
          select: () => ({
            eq: () => Promise.resolve({
              data: null,
              error: new Error('Database error')
            })
          })
        };
      });

      // Execute the controller method
      await userController.getUserDataById(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });

    it('should handle missing uuid parameter', async () => {
      // Mock request with missing uuid
      req.query = {};

      // Execute the controller method
      await userController.getUserDataById(req, res, next);

      // Assertions
      expect(next).toHaveBeenCalled();
    });
  });
}); 