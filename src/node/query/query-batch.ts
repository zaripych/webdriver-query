import { BaseQuery } from './base-query'
import { OneOfQueries } from './one-of-query'
import { ObjectQuery } from './object-query'
import { ResultOfQuery } from './result-of-query'
import { SubQueryInfo } from '../../shared'

export interface IBatchQuery {
  [key: string]: OneOfQueries
}

export type BatchQueryResult<T extends IBatchQuery> = { [P in keyof T]: ResultOfQuery<T[P]> }

declare module './base-query' {
  // tslint:disable-next-line:interface-name
  interface BaseQuery {
    batch<Y extends IBatchQuery>(subQueries: ((q: this) => Y)): ObjectQuery<BatchQueryResult<Y>>
  }
}

BaseQuery.prototype.batch = function batchQuery<Y extends IBatchQuery>(
  this: BaseQuery,
  subQueries: ((q: BaseQuery) => Y)
) {
  const query = this.query.appendCall('batch', new SubQueryInfo(this, subQueries as any))
  return new ObjectQuery<BatchQueryResult<Y>>(this.build(query))
}
