import { NextFunction, Request, Response } from 'express';

// Error handler middleware
const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.status || 500; // Default to 500 if no status is set
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

// Export the error handler
export default errorHandler;
