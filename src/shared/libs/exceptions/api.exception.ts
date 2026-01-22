import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

export class ApiException {

  private static createError(
    message: string,
    field?: string,
    code?: string,
  ): any {

    console.log("API EXCEPTION: ", { message, field, code });
    return {
      message,
      errors: [
        {
          field,
          message,
          code,
        },
      ],
    };
  }

  static unauthorized(
    message: string,
    field?: string,
    code: string = 'UNAUTHORIZED',
  ): UnauthorizedException {
    return new UnauthorizedException(this.createError(message, field, code));
  }

  static badRequest(
    message: string,
    field?: string,
    code: string = 'BAD_REQUEST',
  ): BadRequestException {
    return new BadRequestException(this.createError(message, field, code));
  }

  static forbidden(
    message: string,
    field?: string,
    code: string = 'FORBIDDEN',
  ): ForbiddenException {
    return new ForbiddenException(this.createError(message, field, code));
  }

  static notFound(
    resource: string,
    field?: string,
    code?: string,
  ): NotFoundException {
    const errorCode =
      code || `${resource.toUpperCase().replace(/\s/g, '_')}_NOT_FOUND`;
    return new NotFoundException(
      this.createError(`${resource}`, field, errorCode),
    );
  }

  static conflict(
    resource: string,
    field?: string,
    code?: string,
  ): ConflictException {
    const errorCode =
      code || `${resource.toUpperCase().replace(/\s/g, '_')}_EXISTS`;
    return new ConflictException(
      this.createError(`${resource}`, field, errorCode),
    );
  }

  static tokenExpired(): UnauthorizedException {
    return this.unauthorized('El token ha expirado', 'token', 'TOKEN_EXPIRED');
  }

  static tokenInvalid(): UnauthorizedException {
    return this.unauthorized('Token inválido', 'token', 'TOKEN_INVALID');
  }

  static permissionDenied(
    resource: string = 'recurso',
    field?: string,
  ): ForbiddenException {
    return this.forbidden(
      `No tienes permiso para acceder a este ${resource}`,
      field,
      'PERMISSION_DENIED',
    );
  }

  static insufficientStock(
    available: number,
    field: string = 'quantity',
  ): BadRequestException {
    return this.badRequest(
      `Stock insuficiente. Disponible: ${available}`,
      field,
      'INSUFFICIENT_STOCK',
    );
  }

  static limitExceeded(limit: number, field?: string): BadRequestException {
    return this.badRequest(
      `Límite excedido. Máximo permitido: ${limit}`,
      field,
      'LIMIT_EXCEEDED',
    );
  }

  static duplicateEntry(field: string, value?: string): ConflictException {
    const message = value
      ? `El valor '${value}' ya existe para ${field}`
      : `Entrada duplicada en ${field}`;
    return this.conflict(field, field, 'DUPLICATE_ENTRY');
  }

  static databaseError(message: string = 'Error en la base de datos', field?: string): InternalServerErrorException {
    return new InternalServerErrorException(
      this.createError(message, field, 'DATABASE_ERROR')
    );
  }

  static balanceInsufficient(available: number, channel: string, field: string = 'saldo'): BadRequestException {
    return this.badRequest(
      `Saldo insuficiente. Disponible: ${available} para el canal ${channel}`,
      field,
      'BALANCE_INSUFFICIENT',
    );
  }

  static internalServerError(message: string = 'Error interno del servidor', field?: string): InternalServerErrorException {
    return new InternalServerErrorException(
      this.createError(message, field, 'INTERNAL_SERVER_ERROR')
    );
  }

  // S3 Exceptions
  static s3FileNotFound(fileKey: string, field?: string): NotFoundException {
    return this.notFound(
      `Archivo no encontrado en S3: ${fileKey}`,
      field,
      'S3_FILE_NOT_FOUND'
    );
  }


  static s3Error(message: string, field?: string): InternalServerErrorException {
    return new InternalServerErrorException(
      this.createError(`Error de S3: ${message}`, field, 'S3_ERROR')
    );
  }
}
