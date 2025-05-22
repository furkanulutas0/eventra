import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockRequest, mockResponse, mockNext } from '../setup';
import apiAuthentication from '../../utils/middleware/apiAuthentication';

describe('API Authentication Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    vi.clearAllMocks();
    
    // Store original environment
    process.env = { ...process.env };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call next() when API key is valid', () => {
    // Set up environment variable
    process.env.API_KEY = 'valid-api-key';
    
    // Set up request with valid API key
    req.headers = {
      'x-api-key': 'valid-api-key'
    };

    // Execute middleware
    apiAuthentication(req, res, next);

    // Assertions
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 when API key is invalid', () => {
    // Set up environment variable
    process.env.API_KEY = 'valid-api-key';
    
    // Set up request with invalid API key
    req.headers = {
      'x-api-key': 'invalid-api-key'
    };

    // Execute middleware
    apiAuthentication(req, res, next);

    // Assertions
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid API key' });
  });

  it('should return 401 when API key is missing', () => {
    // Set up environment variable
    process.env.API_KEY = 'valid-api-key';
    
    // Set up request with no API key
    req.headers = {};

    // Execute middleware
    apiAuthentication(req, res, next);

    // Assertions
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid API key' });
  });

  it('should handle case when API_KEY environment variable is not set', () => {
    // Remove API_KEY from environment
    delete process.env.API_KEY;
    
    // Set up request with some API key
    req.headers = {
      'x-api-key': 'some-api-key'
    };

    // Execute middleware
    apiAuthentication(req, res, next);

    // Assertions
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid API key' });
  });
}); 