import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ResponseUtil, ErrorDetail } from '../utils/response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: ErrorDetail[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errors = [{ message: exceptionResponse }];
      } else if (typeof exceptionResponse === 'object') {
        const response = exceptionResponse as any;

        // Handle validation errors from class-validator
        if (Array.isArray(response.message)) {
          message = 'Validation failed';
          errors = this.formatValidationErrors(response.message);
        } else {
          message = response.message || message;

          // If there are existing errors, format them
          if (response.errors) {
            errors = Array.isArray(response.errors) ? response.errors : [{ message: response.errors }];
          } else {
            errors = [{ message }];
          }
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errors = [{ message: exception.message, code: 'INTERNAL_ERROR' }];
    }

    response.status(status).json(ResponseUtil.error(message, errors));
  }

  /**
   * Format validation errors from class-validator
   */
  private formatValidationErrors(validationErrors: any[]): ErrorDetail[] {
    const errors: ErrorDetail[] = [];

    validationErrors.forEach((error) => {
      if (typeof error === 'string') {
        errors.push({ message: error });
      } else if (error.constraints) {
        Object.values(error.constraints).forEach((constraint: any) => {
          errors.push({
            field: error.property,
            message: constraint,
            code: 'VALIDATION_ERROR'
          });
        });
      } else if (error.children && error.children.length > 0) {
        // Handle nested validation errors
        errors.push(...this.formatValidationErrors(error.children));
      }
    });

    return errors;
  }
}
