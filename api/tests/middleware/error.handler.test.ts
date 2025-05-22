import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockRequest, mockResponse, mockNext } from '../setup';
import errorHandler from '../../utils/middleware/error.handler';

describe('Error Handler Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    vi.clearAllMocks();
  });

  it('should handle error with status code', () => {
    // Create error with status
    const error = new Error('Test error');
    (error as any).status = 400;

    // Execute middleware
    errorHandler(error, req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 400,
      message: 'Test error'
    });
  });

  it('should default to 500 status code when no status is provided', () => {
    // Create error without status
    const error = new Error('Internal server error');

    // Execute middleware
    errorHandler(error, req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 500,
      message: 'Internal server error'
    });
  });

  it('should use default message when error has no message', () => {
    // Create error with no message
    const error = new Error();

    // Execute middleware
    errorHandler(error, req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 500,
      message: 'Internal Server Error'
    });
  });

  it('should handle non-Error objects', () => {
    // Create a non-Error object
    const error = { message: 'Custom error object' };

    // Execute middleware
    errorHandler(error, req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 500,
      message: 'Custom error object'
    });
  });

  it('should handle error with custom status code', () => {
    // Create error with custom status
    const error = new Error('Not Found');
    (error as any).status = 404;

    // Execute middleware
    errorHandler(error, req, res, next);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 404,
      message: 'Not Found'
    });
  });
}); 