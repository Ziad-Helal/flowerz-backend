import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import type { GlobalErrorDto } from './global-error.dto';

@Catch()
export class GlobalErrorsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalErrorsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: GlobalErrorDto['details'] = null;

    // 1. Handle raw class-validator errors (ValidationError[])
    if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = 'Validation failed';
      details = this.flattenValidationErrors(exception);
    }

    // 2. Handle TypeORM database errors
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      const pgError: any = exception;

      console.log(pgError);

      code = pgError.code || 'DB_QUERY_FAILED';
      message = this.getDatabaseErrorMessage(pgError);
      details = this.getDatabaseErrorDetails(pgError);
    }

    // 3. Handle NestJS HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      const r =
        typeof res === 'string'
          ? { message: res }
          : (res as Record<string, any>);

      message = r.message ?? message;
      code = r.code ?? HttpStatus[status];
      details = r.details ?? null;
    }

    // 4. Unknown error
    else message = (exception as any)?.message ?? message;

    const errorResponse: GlobalErrorDto = {
      message,
      code,
      status,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    this.logger.error(GlobalErrorsFilter.name, JSON.stringify(errorResponse));
    response.status(status).json(errorResponse);
  }

  private getDatabaseErrorMessage(error: any): string {
    switch (error.code) {
      case '23505':
        return 'Duplicate key value violates unique constraint';
      case '23503':
        return 'Foreign key constraint violation';
      case '22P02':
        return 'Invalid input syntax';
      case '42P01':
        return 'Entity not found';
      case '42712':
        return 'Table name specified more than once';
      default:
        return 'Database query error';
    }
  }

  private getDatabaseErrorDetails(error: any): GlobalErrorDto['details'] {
    if (error.code === '23505') {
      const uniqueKey = error.detail.split(' (')[1].split(')=(')[0];
      return {
        [uniqueKey]: 'Already exists',
      };
    } else
      return {
        database: error.code,
        detail: error.detail || error.hint,
      };
  }

  private flattenValidationErrors(errors: ValidationError[]) {
    const result: Record<string, string[]> = {};
    for (const err of errors) {
      result[err.property] = Object.values(err.constraints || {});
    }
    return result;
  }
}
