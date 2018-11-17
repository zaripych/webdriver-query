import { BaseQuery } from './base-query'
import { AnyResultType } from '../../shared/query'
import { AnyQuery } from './any-query'
import { evaluate } from './evaluate'

declare module './base-query' {
  // tslint:disable-next-line
  interface BaseQuery<T> {
    execute<U extends AnyResultType>(
      script: string | ((element: T, ...args: any[]) => U),
      ...args: any[]
    ): AnyQuery
  }
}

BaseQuery.prototype.execute = function execute<T, U extends AnyResultType>(
  this: BaseQuery<T>,
  script: string | ((element: T, ...args: any[]) => U),
  ...args: any[]
) {
  const query = this.buildingBlock.query.appendCall('execute', ...[script, ...args])
  return new AnyQuery(
    this.buildingBlock.build(() => {
      return this.perform().then(value => {
        return evaluate(script, ...[value, ...args])
      })
    }, query)
  )
}
