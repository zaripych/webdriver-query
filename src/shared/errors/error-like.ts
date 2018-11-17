import * as Errors from '../errors';
import { QueryError } from './query-error';

export interface IErrorLike {
  readonly name: string;
  readonly message: string;
  readonly originalMessage: string;
  readonly stack?: string;
  readonly innerError?: IErrorLike;
}

export class ErrorLike implements IErrorLike {
  public static createError(value: IErrorLike): QueryError {
    if (Errors.ErrorsByName[value.name]) {
      return new Errors.ErrorsByName[value.name](value);
    }
    return new QueryError(value);
  }

  public static isErrorLike(value: {}): value is IErrorLike {
    return (
      value &&
      typeof value === 'object' &&
      'name' in value &&
      'message' in value
    );
  }

  public readonly name: string;
  public readonly message: string;
  public readonly originalMessage: string;
  public readonly stack?: string;
  public readonly innerError?: IErrorLike;

  constructor(error: Error | IErrorLike) {
    this.name = error.name;
    this.message = error.message;
    this.originalMessage = error.message;
    this.stack = error.stack;

    if (error instanceof QueryError) {
      this.originalMessage = error.originalMessage;
      this.stack = error.originalStack || error.stack;
      if (error.innerError) {
        this.innerError = new ErrorLike(error.innerError);
      }
    } else if (ErrorLike.isErrorLike(error)) {
      this.originalMessage = error.originalMessage;
      if (error.innerError) {
        this.innerError = new ErrorLike(error.innerError);
      }
    }
  }
}
