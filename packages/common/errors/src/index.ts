/**
 * Throw this error when a resource is not found in the database
 *
 * @class ResourceNotFoundError
 */
class ResourceNotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}

/**
 * Throw this error when the input is invalid (e.g. missing required fields, request body is not valid, etc.)
 *
 * @class InvalidInputError
 */
class InvalidInputError extends Error {
  statusCode = 400;
  constructor(message: string, code?: number) {
    super(message);
    this.name = "InvalidInputError";
    if (code) this.statusCode = code;
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
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
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
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
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
 */
class OperationNotAllowedError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = "OperationNotAllowedError";
  }
}

/**
 * Throw this error when the user is not authenticated
 *
 * @class AuthenticationError
 */
class AuthenticationError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Throw this error when the user is not authenticated
 *
 * @class AuthorizationError
 */
class AuthorizationError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

class InternalServerError extends Error {
  statusCode = 500;
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}

class Assertions {
  public invalidInput(condition: boolean, message: string, status = 400) {
    if (condition) throw new InvalidInputError(message, status);
  }

  public badRequest(condition: boolean, message: string) {
    if (condition) throw new BadRequestError(message);
  }

  public authentication(condition: boolean, message: string) {
    if (condition) throw new AuthenticationError(message);
  }

  public authorization(condition: boolean, message: string) {
    if (condition) throw new AuthorizationError(message);
  }

  public resourceNotFound(condition: boolean, message: string) {
    if (condition) throw new ResourceNotFoundError(message);
  }

  public operationNotAllowed(condition: boolean, message: string) {
    if (condition) throw new OperationNotAllowedError(message);
  }

  public database(condition: boolean, message: string) {
    if (condition) throw new DatabaseError(message);
  }

  public validation(condition: boolean, message: string) {
    if (condition) throw new ValidationError(message);
  }

  public internalServer(condition: boolean, message: string) {
    if (condition) throw new InternalServerError(message);
  }

  public unknown(condition: boolean, message: string) {
    if (condition) throw new UnknowError(message);
  }
}

export {
  ResourceNotFoundError,
  InvalidInputError,
  ValidationError,
  UnknowError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  OperationNotAllowedError,
  InternalServerError,
  BadRequestError,
  Assertions
};
