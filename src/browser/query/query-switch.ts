import {
  IBaseQuery,
  isQuery,
  IQueryConstructor,
  BaseQuery
} from './base-query';
import { Query } from './query';
import { AnyQuery } from './any-query';
import { OutOfOptionsError, ArgumentError } from '../../shared/errors';
import { StringQuery } from './string-query';
import { NumberQuery } from './number-query';
import { ConditionQuery } from './condition-query';
import { Errors } from '..';
import { QueryBuildingBlock } from './query-building-block';
import { QueryForResultType, ResultOfQuery } from './result-of-query';
import { OneOfQueries } from './one-of-query';
import { QueryBuilder } from '../../shared';

declare module './query' {
  // tslint:disable-next-line
  interface Query {
    switch<T extends OneOfQueries, U extends OneOfQueries>(
      query: (q: this) => OneOfQueries,
      truthy: (q: this) => T,
      falsy: (q: this) => U
    ): QueryForResultType<ResultOfQuery<T | U>>;

    switch<T extends OneOfQueries, U extends OneOfQueries>(
      query: (q: this) => StringQuery,
      options: (q: this) => { [key: string]: T },
      whenNoneMatches: (q: this) => U
    ): QueryForResultType<ResultOfQuery<T | U>>;
    switch<T extends OneOfQueries>(
      query: (q: this) => StringQuery,
      options: (q: this) => { [key: string]: T }
    ): QueryForResultType<ResultOfQuery<T>>;

    switch<T extends OneOfQueries, U extends OneOfQueries>(
      query: (q: this) => NumberQuery,
      options: (q: this) => { [key: number]: T },
      whenNoneMatches: (q: Query) => U
    ): QueryForResultType<ResultOfQuery<T | U>>;
    switch<T extends OneOfQueries>(
      query: (q: this) => NumberQuery,
      options: (q: this) => { [key: number]: T }
    ): QueryForResultType<ResultOfQuery<T>>;
  }
}

declare module './base-query' {
  // tslint:disable-next-line
  interface BaseQuery<T> {
    switch<T extends OneOfQueries, U extends OneOfQueries>(
      truthy: (q: this) => T,
      falsy: (q: this) => U
    ): QueryForResultType<ResultOfQuery<T | U>>;
  }
}

declare module './string-query' {
  // tslint:disable-next-line
  interface StringQuery {
    switch<T extends OneOfQueries, U extends OneOfQueries>(
      options: (q: this) => { [key: string]: T },
      whenNoneMatches: (q: this) => U
    ): QueryForResultType<ResultOfQuery<T | U>>;
    switch<T extends OneOfQueries>(
      options: (q: this) => { [key: string]: T }
    ): QueryForResultType<ResultOfQuery<T>>;
  }
}

declare module './number-query' {
  // tslint:disable-next-line
  interface NumberQuery {
    switch<T extends OneOfQueries, U extends OneOfQueries>(
      options: (q: this) => { [key: number]: T },
      whenNoneMatches: (q: this) => U
    ): QueryForResultType<ResultOfQuery<T | U>>;
    switch<T extends OneOfQueries>(
      options: (q: this) => { [key: number]: T }
    ): QueryForResultType<ResultOfQuery<T>>;
  }
}

function switchWithValidation<This, Q extends IBaseQuery<R>, R = any>(
  buildOn: This,
  query: QueryBuilder,
  buildingBlock: QueryBuildingBlock<any>,
  arg1: (q: This) => OneOfQueries | NumberQuery | StringQuery,
  arg2: (
    q: This
  ) =>
    | Q
    | {
        [key: string]: Q;
      },
  arg3?: (q: This) => Q
) {
  if (!arg1 || typeof arg1 !== 'function') {
    throw new Errors.ArgumentError(
      'First argument is required, it should be a function returning a query'
    );
  }
  if (!arg2 || typeof arg2 !== 'function') {
    throw new Errors.ArgumentError(
      'Second argument is required, it should be a function returning a query'
    );
  }

  const test = arg1(buildOn);
  if (!isQuery(test)) {
    throw new ArgumentError(
      'The first argument function should return a query'
    );
  }

  const arg2Result = arg2(buildOn);

  if (isQuery(arg2Result)) {
    if (!arg3) {
      throw new Errors.ArgumentError(
        'When first argument is a condition query the third argument' +
          'is required'
      );
    }

    const truthy = arg2Result;
    const falsy = arg3(buildOn);
    if (!isQuery(falsy)) {
      throw new ArgumentError(
        'The third argument function should return a query'
      );
    }

    const constructor: any =
      truthy.constructor === falsy.constructor ? truthy.constructor : AnyQuery;
    return switchBooleanTo(
      query,
      buildingBlock,
      constructor,
      test,
      truthy,
      falsy
    );
  } else if (test instanceof StringQuery || test instanceof NumberQuery) {
    const options = arg2(buildOn) as {
      [key: string]: Q;
    };
    if (typeof options !== 'object') {
      throw new Errors.ArgumentError(
        'When first parameter is a string or number query the second' +
          'argument function should return an object with options'
      );
    }

    const keys = Object.keys(options);
    keys.forEach(key => {
      if (!isQuery(options[key])) {
        throw new Errors.ArgumentError(
          `The option with value ${key} doesn't resolve to a query`
        );
      }
    });

    const values = keys.map(key => options[key]);

    const whenNoMatch = arg3 ? arg3(buildOn) : undefined;
    if (whenNoMatch !== undefined && !isQuery(whenNoMatch)) {
      throw new ArgumentError(
        'The last argument function should return a query'
      );
    }

    const noMatchConstructor = whenNoMatch && whenNoMatch.constructor;

    let constructor: any = AnyQuery;
    if (keys.length === 0) {
      constructor = noMatchConstructor ? noMatchConstructor : AnyQuery;
    } else if (values.every(q => q.constructor === values[0].constructor)) {
      if (noMatchConstructor) {
        constructor =
          noMatchConstructor === values[0].constructor
            ? values[0].constructor
            : AnyQuery;
      } else {
        constructor = values[0].constructor;
      }
    }

    return switchStringOrNumberTo(
      query,
      buildingBlock,
      constructor,
      test,
      options,
      whenNoMatch
    );
  } else {
    /* istanbul ignore next */
    throw new Errors.ArgumentError(
      'When processing list of options only string or number returning query can be used'
    );
  }
}

function switchBooleanTo<Q extends IBaseQuery<Qr>, Qr = any>(
  query: QueryBuilder,
  buildingBlock: QueryBuildingBlock<void>,
  constructor: IQueryConstructor<Qr, Q>,
  testedQuery: IBaseQuery<any>,
  truthy: Q,
  falsy: Q
): Q {
  return new constructor(
    buildingBlock.build(() => {
      return testedQuery.perform().then(value => {
        const continueQuery = value ? truthy : falsy;
        return continueQuery.perform();
      });
    }, query)
  );
}

function switchStringOrNumberTo<Q extends IBaseQuery<Qr>, Qr = any>(
  query: QueryBuilder,
  buildingBlock: QueryBuildingBlock<void>,
  constructor: IQueryConstructor<Qr, Q>,
  testedQuery: IBaseQuery<string | number>,
  options: { [key: string]: Q; [key: number]: Q },
  whenNoMatch?: Q
): Q {
  return new constructor(
    buildingBlock.build(() => {
      return testedQuery.perform().then(value => {
        const continueQuery = options[value];
        if (!continueQuery) {
          if (whenNoMatch) {
            return whenNoMatch.perform();
          }
          throw new OutOfOptionsError(
            `None of the sub-queries match the resulting value: ${value}`,
            query
          );
        }
        return continueQuery.perform();
      });
    }, query)
  );
}

Query.prototype.switch = function switchOverloaded<
  Q extends IBaseQuery<Qr>,
  Qr = any
>(
  this: Query,
  arg0: (q: Query) => ConditionQuery | NumberQuery | StringQuery,
  arg1: (
    q: Query
  ) =>
    | Q
    | {
        [key: string]: Q;
      },
  arg2?: (q: Query) => Q
) {
  const args: any[] = [arg0, arg1, arg2].filter(element => !!element);
  const query = this.buildingBlock.query.appendCall('switch', ...args);
  return switchWithValidation(
    this,
    query,
    this.buildingBlock,
    arg0,
    arg1,
    arg2
  );
};

BaseQuery.prototype.switch = function switchForAllQueries<T>(
  this: BaseQuery<T>,
  arg1: (q: BaseQuery<T>) => any,
  arg2: (q: BaseQuery<T>) => any
) {
  const args: any[] = [arg1, arg2].filter(element => !!element);
  const query = this.buildingBlock.query.appendCall('switch', ...args);
  return switchWithValidation(
    this,
    query,
    this.buildingBlock,
    () => this,
    arg1,
    arg2
  );
};

StringQuery.prototype.switch = function switchForString(
  this: StringQuery,
  arg1: (q: StringQuery) => { [key: string]: any },
  arg2?: (q: StringQuery) => any
) {
  const args: any[] = [arg1, arg2].filter(element => !!element);
  const query = this.buildingBlock.query.appendCall('switch', ...args);
  return switchWithValidation(
    this,
    query,
    this.buildingBlock,
    () => this,
    arg1,
    arg2
  );
};

NumberQuery.prototype.switch = function switchForNumber(
  this: NumberQuery,
  arg1: (q: NumberQuery) => { [key: number]: any },
  arg2?: (q: NumberQuery) => any
) {
  const args: any[] = [arg1, arg2].filter(element => !!element);
  const query = this.buildingBlock.query.appendCall('switch', ...args);
  return switchWithValidation(
    this,
    query,
    this.buildingBlock,
    () => this,
    arg1,
    arg2
  );
};
