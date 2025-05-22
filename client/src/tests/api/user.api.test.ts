import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { getUserData, signIn, signUp } from '../../api/user.api';
import type { Mock } from 'vitest';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: Mock;
  post: Mock;
  put: Mock;
  delete: Mock;
};

describe('User API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserData', () => {
    it('should fetch user data successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          uuid: 'test-uuid',
          email: 'test@example.com',
          name: 'Test',
          surname: 'User'
        }
      };

      // Setup axios mock
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await getUserData('test-uuid');

      // Assertions
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/user/getUserDataById?uuid=test-uuid');
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when fetching user data', async () => {
      // Setup axios mock to throw error
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      // Execute and assert
      await expect(getUserData('test-uuid')).rejects.toThrow('Network error');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/user/getUserDataById?uuid=test-uuid');
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          sucess: true,
          message: 'User başarıyla giriş yaptı.',
          data: [{
            uuid: 'test-uuid',
            email: 'test@example.com',
            name: 'Test',
            surname: 'User'
          }]
        }
      };

      // Setup axios mock
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await signIn('test@example.com', 'password123');

      // Assertions
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signin', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when signing in', async () => {
      // Mock error response
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };

      // Setup axios mock to throw error
      mockedAxios.post.mockRejectedValueOnce(mockErrorResponse);

      // Execute and assert
      await expect(signIn('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signin', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    });

    it('should handle generic error when signing in', async () => {
      // Setup axios mock to throw generic error
      mockedAxios.post.mockRejectedValueOnce(new Error());

      // Execute and assert
      await expect(signIn('test@example.com', 'password123')).rejects.toThrow('Failed to sign in.');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signin', {
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      // Mock response
      const mockResponse = {
        data: {
          message: 'User created successfully',
          data: [{
            uuid: 'new-uuid'
          }]
        }
      };

      // Setup axios mock
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Execute the API call
      const result = await signUp('new@example.com', 'password123', 'New', 'User');

      // Assertions
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signup', {
        email: 'new@example.com',
        password: 'password123',
        name: 'New',
        surname: 'User'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should sign up user with minimal data', async () => {
      // Mock response
      const mockResponse = {
        data: {
          message: 'User created successfully',
          data: [{
            uuid: 'new-uuid'
          }]
        }
      };

      // Setup axios mock
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Execute the API call with only required fields
      const result = await signUp('new@example.com', 'password123');

      // Assertions
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signup', {
        email: 'new@example.com',
        password: 'password123',
        name: undefined,
        surname: undefined
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error when signing up', async () => {
      // Mock error response
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Email already exists'
          }
        }
      };

      // Setup axios mock to throw error
      mockedAxios.post.mockRejectedValueOnce(mockErrorResponse);

      // Execute and assert
      await expect(signUp('existing@example.com', 'password123', 'Test', 'User')).rejects.toThrow('Email already exists');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signup', {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User'
      });
    });

    it('should handle generic error when signing up', async () => {
      // Setup axios mock to throw generic error
      mockedAxios.post.mockRejectedValueOnce(new Error());

      // Execute and assert
      await expect(signUp('new@example.com', 'password123')).rejects.toThrow('Failed to sign up.');
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signup', {
        email: 'new@example.com',
        password: 'password123',
        name: undefined,
        surname: undefined
      });
    });
  });
}); 