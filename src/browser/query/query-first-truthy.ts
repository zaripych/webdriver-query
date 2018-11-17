import { IBaseQuery, IQueryConstructor } from './base-query';
import { Query } from './query';
import { AnyQuery } from './any-query';
import { OutOfOptionsError, ArgumentError } from '../../shared/errors';
import { StringQuery } from './string-query';
import { NullableStringQuery } from './nullable-string-query';
import { ElementQuery } from './element-query';
import { NumberQuery } from './number-query';
import { ConditionQuery } from './condition-query';
import { AnyResultType } from '../../shared/query';

declare module './query' {
  // tslint:disable-next-line
  interface Query {
    firstTruthy(
      queries: StringQuery[] | ((q: this) => StringQuery[])
    ): StringQuery;
    firstTruthy(
      queries: NullableStringQuery[] | ((q: this) => NullableStringQuery[])
    ): NullableStringQuery;
    firstTruthy(
      queries: ElementQuery[] | ((q: this) => ElementQuery[])
    ): ElementQuery;
    firstTruthy(
      queries: NumberQuery[] | ((q: this) => NumberQuery[])
    ): NumberQuery;
    firstTruthy(
      queries: ConditionQuery[] | ((q: this) => ConditionQuery[])
    ): ConditionQuery;
    firstTruthy<R, Qr extends IBaseQuery<R>>(
      queries: Qr[] | ((q: this) => Qr[])
    ): AnyQuery;
  }
}

Query.prototype.firstTruthy = function first<R, Qr extends IBaseQuery<R>>(
  queries: [Qr] | ((q: Query) => Qr[])
): Qr | AnyQuery {
  const subQueries = typeof queries === 'function' ? queries(this) : queries;

  /* istanbul ignore next */
  if (!Array.isArray(subQueries)) {
    throw new ArgumentError(
      'Expected the first parameter to be a non-empty Array of queries or a function ' +
        `that returns a non-empty Array of queries, received ${typeof subQueries} instead`
    );
  }
  /* istanbul ignore next */
  if (subQueries.length === 0) {
    throw new ArgumentError(
      'Expected the first parameter to be a non-empty Array of queries or a function ' +
        `that returns a non-empty Array of queries, received an empty array instead`
    );
  }

  const firstType = subQueries[0].constructor;

  const query = this.buildingBlock.query.appendCall('first', queries);

  const queryFactory = (): Promise<R | AnyResultType> => {
    let index = 0;
    const iterate = (): Promise<AnyResultType> => {
      if (index < 0 || index >= subQueries.length) {
        return Promise.reject(
          new OutOfOptionsError(
            'None of the sub-queries resolved' +
              ' or all of them resolved as falsy',
            query
          )
        );
      }
      return subQueries[index]
        .perform()
        .catch(err => {
          this.buildingBlock.logger.debug(() => [
            `firstTruthy, ignoring error at ${index}`,
            err
          ]);
          index++;
          return iterate();
        })
        .then(result => {
          if (result) {
            return Promise.resolve(result);
          }
          index++;
          return iterate();
        });
    };
    return iterate();
  };

  if (subQueries.every(item => item.constructor === firstType)) {
    const constructor = subQueries[0].constructor as IQueryConstructor<R, Qr>;
    return new constructor(
      this.buildingBlock.build<R>(queryFactory as () => Promise<R>, query)
    );
  } else {
    return new AnyQuery(
      this.buildingBlock.build(
        queryFactory as () => Promise<AnyResultType>,
        query
      )
    );
  }
};
