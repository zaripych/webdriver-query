import { BaseQuery } from './base-query'
import { IInstanceWaitOptions, SubQueryInfo } from '../../shared/query'
import { ConditionQuery } from './condition-query'

// tslint:disable:interface-name

declare module './base-query' {
  interface BaseQuery {
    waitUntil(condition: (q: this) => ConditionQuery, waitOptions?: IInstanceWaitOptions): this

    retry(waitOptions?: IInstanceWaitOptions): this
  }
}

BaseQuery.prototype.waitUntil = function waitUntil(
  this: BaseQuery,
  condition: (q: BaseQuery) => ConditionQuery,
  waitOptions?: IInstanceWaitOptions
): BaseQuery {
  const conditionSubQuery = new SubQueryInfo(this, condition as any)
  const query = this.query.appendCall(
    'waitUntil',
    ...(waitOptions ? [conditionSubQuery, waitOptions] : [conditionSubQuery])
  )
  return this.create(this.build(query))
}

BaseQuery.prototype.retry = function waitUntil(
  this: BaseQuery,
  waitOptions?: IInstanceWaitOptions
): BaseQuery {
  const query = this.query.appendCall('retry', ...(waitOptions ? [waitOptions] : []))
  return this.create(this.build(query))
}
