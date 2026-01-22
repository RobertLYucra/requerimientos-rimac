export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ErrorDetail[];
}

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export class ResponseUtil {
  static success<T>(message: string, data: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, errors?: ErrorDetail[]): ApiResponse<null> {
    return {
      success: false,
      message,
      errors: errors || [],
    };
  }

  static validationError(errors: ErrorDetail[]): ApiResponse<null> {
    return {
      success: false,
      message: 'Error de validación',
      errors,
    };
  }
  static singleError(message: string, field?: string, code?: string): ApiResponse<null> {
    return {
      success: false,
      message,
      errors: [{ message, field, code }],
    };
  }
}
