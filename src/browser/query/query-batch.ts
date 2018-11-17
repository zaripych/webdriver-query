import { QueryBuildingBlock } from './query-building-block';
import { BaseQuery } from './base-query';
import { Query } from './query';
import { OneOfQueries } from './one-of-query';
import { ObjectQuery } from './object-query';
import { ResultOfQuery } from './result-of-query';

export interface IBatchQuery {
  [key: string]: OneOfQueries;
}

export type BatchQueryResult<T extends IBatchQuery> = {
  [P in keyof T]: ResultOfQuery<T[P]>
};

declare module './query' {
  // tslint:disable-next-line
  interface Query {
    batch<Y extends IBatchQuery>(
      subQueries: Y | ((q: this) => Y)
    ): ObjectQuery<BatchQueryResult<Y>>;
  }
}

declare module './base-query' {
  // tslint:disable-next-line
  interface BaseQuery<T> {
    batch<Y extends IBatchQuery>(
      subQueries: Y | ((q: this) => Y)
    ): ObjectQuery<BatchQueryResult<Y>>;
  }
}

function batch<Y extends IBatchQuery, R, S>(
  subQueries: Y | ((q: S) => Y),
  parent: S,
  buildingBlock: QueryBuildingBlock<R>
): ObjectQuery<BatchQueryResult<Y>> {
  const queries: Y =
    typeof subQueries === 'function' ? subQueries(parent) : subQueries;
  const query = buildingBlock.query.appendCall('batch', subQueries);
  return new ObjectQuery<BatchQueryResult<Y>>(
    buildingBlock.build(() => {
      const props = Object.getOwnPropertyNames(queries);
      return buildingBlock.perform().then(() => {
        const promises = props.map(
          (prop) => queries[prop].perform() as Promise<{}>
        );
        return Promise.all(promises).then((result) => {
          const combined: { [key: string]: {} } = {};
          props.reduce((prev, curr, ind) => {
            prev[curr] = result[ind];
            return prev;
          }, combined);
          return combined as BatchQueryResult<Y>;
        });
      });
    }, query)
  );
}

Query.prototype.batch = function batchQuery(this: Query, subQueries) {
  return batch(subQueries, this, this.buildingBlock);
};

BaseQuery.prototype.batch = function batchQuery<T, Y extends IBatchQuery>(
  this: BaseQuery<T>,
  subQueries: Y | ((q: BaseQuery<T>) => Y)
) {
  return batch(subQueries, this, this.buildingBlock);
};
