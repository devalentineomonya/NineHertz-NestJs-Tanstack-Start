import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: string;
  details?: any;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseObj: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal Server Error',
    };

    // Handle ForbiddenException first
    if (exception instanceof ForbiddenException) {
      responseObj.statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        responseObj.message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        responseObj.message =
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (exceptionResponse as any)?.message || 'Forbidden';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        responseObj.error = (exceptionResponse as any)?.error || 'Forbidden';
      }
    }
    // Handle HttpException (including class-validator errors)
    else if (
      exception instanceof HttpException ||
      (typeof exception === 'object' &&
        exception !== null &&
        'getStatus' in exception &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof (exception as any).getStatus === 'function')
    ) {
      const httpException = exception as HttpException;
      responseObj.statusCode = httpException.getStatus();
      const exceptionResponse = httpException.getResponse();

      if (typeof exceptionResponse === 'string') {
        responseObj.message = exceptionResponse;
        responseObj.error = HttpStatus[responseObj.statusCode];
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, any>;

        // Special handling for class-validator errors
        if (Array.isArray(res.message)) {
          responseObj.message = res.message;
          responseObj.error =
            typeof res.error === 'string' ? res.error : 'Validation Error';
        }
        // Standard HttpException error format
        else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          responseObj.message = res.message || 'Error';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          responseObj.error = res.error || HttpStatus[responseObj.statusCode];
        }
      }
    }
    // Handle TypeORM QueryFailedError
    else if (exception instanceof QueryFailedError) {
      responseObj.statusCode = HttpStatus.BAD_REQUEST;
      responseObj.message = 'Database query failed';
      responseObj.error = 'Database Error';
      responseObj.details = exception.message;
    }
    // Handle generic JavaScript errors
    else if (exception instanceof Error) {
      responseObj.message = exception.message;
      responseObj.error = 'Internal Server Error';

      if (process.env.NODE_ENV === 'development') {
        responseObj.details = exception.stack;
      }
    }

    // Log only 500+ errors
    if (responseObj.statusCode >= 500) {
      console.error(`[${responseObj.timestamp}] ERROR:`, exception);
    }

    response.status(responseObj.statusCode).json(responseObj);
  }
}
