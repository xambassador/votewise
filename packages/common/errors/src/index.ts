/**
 * Throw this error when a resource is not found in the database
 *
 * @class ResourceNotFoundError
 */
class ResourceNotFoundError extends Error {
  statusCode = 404;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "ResourceNotFoundError";
    this.errorCode = errorCode;
  }
}

/**
 * Throw this error when the input is invalid (e.g. missing required fields, request body is not valid, etc.)
 *
 * @class InvalidInputError
 */
class InvalidInputError extends Error {
  statusCode = 400;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "InvalidInputError";
    this.errorCode = errorCode;
  }
}

/**
 * Throw this error when the doing a validation. Alias of InvalidInputError
 *
 * @class ValidationError
 * @alias InvalidInputError
 */
class ValidationError extends Error {
  statusCode = 400;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "ValidationError";
    this.errorCode = errorCode;
  }
}

/**
 * Throw this error when the doing a validation. Alias of InvalidInputError
 *
 * @class BadRequestError
 * @alias InvalidInputError
 */
class BadRequestError extends Error {
  statusCode = 400;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "BadRequestError";
    this.errorCode = errorCode;
  }
}

/**
 * Throw this error when error is not known (e.g. runtime errors)
 *
 * @class UnknowError
 */
class UnknowError extends Error {
  statusCode = 500;
  error?: unknown;
  constructor(message: string, error?: unknown) {
    super(message);
    this.name = "UnknowError";
    this.error = error;
  }
}

/**
 * Throw this error when there is an error in the database
 *
 * @class DatabaseError
 */
class DatabaseError extends Error {
  statusCode = 500;
  error?: unknown;
  constructor(message: string, error?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.error = error;
  }
}

/**
 * Throw this error when the user is authenticated but does not have the permission to do the operation
 *
 * @class OperationNotAllowedError
 * @alias ForbiddenError
 */
class OperationNotAllowedError extends Error {
  statusCode = 403;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "OperationNotAllowedError";
    this.errorCode = errorCode;
  }
}

/**
 * Throw this error when the user is not authenticated
 *
 * @class AuthenticationError
 */
class AuthenticationError extends Error {
  statusCode = 401;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "AuthenticationError";
    this.errorCode = errorCode;
  }
}

class InternalServerError extends Error {
  statusCode = 500;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "InternalServerError";
    this.errorCode = errorCode;
  }
}

class UnprocessableEntityError extends Error {
  statusCode = 422;
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.name = "UnprocessableEntityError";
    this.errorCode = errorCode;
  }
}

class Assertions {
  public invalidInput(condition: boolean, message: string, errorCode = 400) {
    if (condition) throw new InvalidInputError(message, errorCode);
  }

  public badRequest(condition: boolean, message: string, errorCode = 400) {
    if (condition) throw new BadRequestError(message, errorCode);
  }

  public authentication(condition: boolean, message: string, errorCode = 401) {
    if (condition) throw new AuthenticationError(message, errorCode);
  }

  public resourceNotFound(condition: boolean, message: string, errorCode = 404) {
    if (condition) throw new ResourceNotFoundError(message, errorCode);
  }

  public operationNotAllowed(condition: boolean, message: string, errorCode = 403) {
    if (condition) throw new OperationNotAllowedError(message, errorCode);
  }

  public database(condition: boolean, message: string) {
    if (condition) throw new DatabaseError(message);
  }

  public validation(condition: boolean, message: string, errorCode = 400) {
    if (condition) throw new ValidationError(message, errorCode);
  }

  public internalServer(condition: boolean, message: string, errorCode = 500) {
    if (condition) throw new InternalServerError(message, errorCode);
  }

  public unknown(condition: boolean, message: string) {
    if (condition) throw new UnknowError(message);
  }

  public forbidden(condition: boolean, message: string, errorCode = 403) {
    if (condition) throw new OperationNotAllowedError(message, errorCode);
  }

  public unprocessableEntity(condition: boolean, message: string, errorCode = 422) {
    if (condition) throw new UnprocessableEntityError(message, errorCode);
  }
}

export {
  ResourceNotFoundError,
  InvalidInputError,
  ValidationError,
  UnknowError,
  DatabaseError,
  AuthenticationError,
  OperationNotAllowedError,
  InternalServerError,
  BadRequestError,
  Assertions,
  UnprocessableEntityError
};
