import { ErrorLike } from './error-like';
import { QueryBuilder } from '../query';

export interface IErrorConstructor<T extends Error> {
  new (message: string | ErrorLike, query?: QueryBuilder): T;
  new (message: string | ErrorLike, inner?: Error, query?: QueryBuilder): T;
}

export class QueryError extends Error {
  private static appendInnerText<T>(
    text: string,
    inner: T | undefined,
    padBy: number,
    delimiter: string,
    innerTextRetriever: (x: T) => string
  ) {
    if (inner) {
      const innerText = innerTextRetriever(inner);
      const pad = '  '.repeat(padBy);
      const shiftedInnerText = innerText.replace(/\n/g, `\n${pad}`);
      return `${text}\n${pad}${delimiter}${shiftedInnerText}`;
    }
    return text;
  }

  private static collectMessage(
    message: string,
    inner?: Error | QueryError
  ): string {
    const delimiter = ' --> ';

    const getErrorNameAndMessage = (exc: Error | QueryError) =>
      exc instanceof QueryError
        ? `${exc.name}: ${exc.originalMessage}`
        : `${exc.name}: ${exc.message}`;

    let indent = 1;

    let msg = QueryError.appendInnerText<Error | QueryError>(
      message,
      inner,
      indent,
      delimiter,
      getErrorNameAndMessage
    );
    indent += 1;

    let current = (inner instanceof QueryError && inner.innerError) || null;

    while (current) {
      msg = QueryError.appendInnerText(
        msg,
        current,
        indent,
        delimiter,
        getErrorNameAndMessage
      );
      indent += 1;

      current = (current instanceof QueryError && current.innerError) || null;
    }

    return msg;
  }

  public readonly originalMessage: string;
  public readonly originalStack?: string;
  public readonly innerError?: Error | QueryError;

  constructor(message: string | ErrorLike);
  constructor(message: string, query?: QueryBuilder);
  constructor(
    message: string,
    inner?: Error,
    query?: QueryBuilder,
    additional?: string
  );
  constructor(
    message: string | ErrorLike,
    arg1?: Error | QueryBuilder,
    arg2?: QueryBuilder,
    arg3?: string
  ) {
    if (typeof message === 'string') {
      const inner = (arg1 instanceof Error && arg1) || undefined;
      const query = (arg1 instanceof QueryBuilder && arg1) || arg2;
      const additional = arg3;
      const blocks = [
        message,
        query
          ? `, when executing a sub-query:\n\n    ${query.buildDescription(
              1
            )}\n`
          : '',
        additional || ''
      ];
      const description = blocks.join('');
      super(QueryError.collectMessage(description, inner));
      this.originalMessage = description;
      if (inner) {
        this.innerError = inner;
      }
    } else if (ErrorLike.isErrorLike(message)) {
      const errorLike = message;
      super(errorLike.message);
      this.originalMessage = errorLike.originalMessage;
      if (errorLike.innerError) {
        this.innerError = ErrorLike.createError(errorLike.innerError);
      }
      this.originalStack = errorLike.stack;
    } else {
      super(`${message}`);
      this.originalMessage = `${message}`;
    }
  }
}

QueryError.prototype.name = 'QueryError';
