import { IBaseQuery, BaseQuery, IQueryBuildingBlock, IQueryConstructor } from './base-query'
import { ArgumentError, NoSuchElementError } from '../../shared/errors'
import { NumberQuery } from './number-query'
import { ConditionQuery } from './condition-query'
import { ResultOfQuery, QueryForResultType } from './result-of-query'

export type QueryFactory<T, Q> = (buildingBlock: IQueryBuildingBlock<T>) => Q

export interface IArrayQueryConstructor<
  E,
  Eq extends IBaseQuery<any> = QueryForResultType<E>,
  ArrQ extends ArrayQuery<E, Eq> = ArrayQuery<E, Eq>
> {
  new (block: IQueryBuildingBlock<E[]>, itemQueryFactory: QueryFactory<E, Eq>): ArrQ
}

export class ArrayQuery<E, Eq extends IBaseQuery<any> = QueryForResultType<E>> extends BaseQuery<
  E[]
> {
  public readonly itemQueryFactory: QueryFactory<E, Eq>

  constructor(buildInfo: IQueryBuildingBlock<E[]>, itemQueryFactory: QueryFactory<E, Eq>) {
    super(buildInfo)
    /* istanbul ignore next */
    if (!itemQueryFactory) {
      throw new ArgumentError('itemQueryFactory should be initialized')
    }
    this.itemQueryFactory = itemQueryFactory
  }

  public count(): NumberQuery {
    const query = this.query.appendCall('count')
    return new NumberQuery(
      this.build(() => {
        return this.perform().then(elements => {
          return elements.length
        })
      }, query)
    )
  }

  public at(index: number): Eq {
    const query = this.query.appendCall('at', index)
    return this.itemQueryFactory(
      this.build(() => {
        return this.perform().then(elements => {
          if (!Number.isSafeInteger(index)) {
            return Promise.reject(new ArgumentError(`index (${index}) is not an integer`))
          } else if (index >= 0 && index < elements.length) {
            return Promise.resolve(elements[index])
          } else {
            return Promise.reject(
              new ArgumentError(`index (${index}) is out of bounds (${elements.length})`)
            )
          }
        })
      }, query)
    )
  }

  public first(condition: (q: Eq) => ConditionQuery): Eq {
    const query = this.query.appendCall('first', condition)
    return this.itemQueryFactory(
      this.build(() => {
        return this.perform().then(items => {
          if (items.length === 0) {
            return Promise.reject(new ArgumentError('There are no items'))
          }

          let index = 0
          const iterate: () => Promise<E> = () => {
            if (index < 0 || index >= items.length) {
              return Promise.reject(new NoSuchElementError('No items found matching the condition'))
            }

            const itemQueryBuilder = this.query.appendCall('at', index)
            const itemQuery = this.itemQueryFactory(
              this.build(() => Promise.resolve(items[index]), itemQueryBuilder)
            )
            const conditionQuery = condition(itemQuery)

            return conditionQuery.perform().then(conditionResult => {
              if (conditionResult) {
                return Promise.resolve(items[index])
              }
              index++
              return iterate()
            })
          }
          return iterate()
        })
      }, query)
    )
  }

  public indexOf(condition: (q: Eq) => ConditionQuery): NumberQuery {
    const query = this.query.appendCall('indexOf', condition)
    return new NumberQuery(
      this.build(() => {
        return this.perform().then(items => {
          if (items.length === 0) {
            return Promise.reject(new ArgumentError('There are no items'))
          }

          let index = 0
          const iterate: () => Promise<number> = () => {
            if (index < 0 || index >= items.length) {
              return Promise.reject(new NoSuchElementError('No items found matching the condition'))
            }

            const itemQueryBuilder = this.query.appendCall('at', index)
            const itemQuery = this.itemQueryFactory(
              this.build(() => Promise.resolve(items[index]), itemQueryBuilder)
            )
            const conditionQuery = condition(itemQuery)

            return conditionQuery.perform().then(value => {
              if (value) {
                return Promise.resolve(index)
              }
              index++
              return iterate()
            })
          }
          return iterate()
        })
      }, query)
    )
  }

  public filter(condition: (q: Eq) => ConditionQuery): this {
    const query = this.query.appendCall('filter', condition)
    return this.create(
      this.build(() => {
        return this.perform().then(items => {
          if (items.length === 0) {
            return Promise.resolve([])
          }

          const filteredItems: E[] = []
          let index = 0
          const iterate = (): Promise<E[]> => {
            if (index < 0 || index >= items.length) {
              return Promise.resolve(filteredItems)
            }

            const itemQueryBuilder = this.query.appendCall('at', index)
            const itemQuery = this.itemQueryFactory(
              this.build(() => Promise.resolve(items[index]), itemQueryBuilder)
            )
            const conditionQuery = condition(itemQuery)

            return conditionQuery.perform().then(value => {
              if (value) {
                filteredItems.push(items[index])
              }
              index++
              return iterate()
            })
          }

          return iterate()
        })
      }, query)
    )
  }

  public create(block: IQueryBuildingBlock<E[]>): this {
    const constructor = this.constructor as IArrayQueryConstructor<E, Eq, this>
    return new constructor(block, this.itemQueryFactory)
  }
}

export function createArrayQuery<T extends IBaseQuery<R>, R = ResultOfQuery<T>>(
  buildingBlock: IQueryBuildingBlock<R[]>,
  factory: QueryFactory<R, T>
): ArrayQuery<R, T> {
  return new ArrayQuery<R, T>(buildingBlock, factory)
}

export function createArrayQueryForSingleElementQuery<
  T extends IBaseQuery<R>,
  R = ResultOfQuery<T>
>(query: T, buildingBlock: IQueryBuildingBlock<R[]>): ArrayQuery<R, T> {
  if (query instanceof ArrayQuery) {
    // R is an array already
    const factory = (block: IQueryBuildingBlock<R>) => {
      return (new ArrayQuery(block as any, query.itemQueryFactory) as any) as T
    }
    return new ArrayQuery<R, T>(buildingBlock, factory)
  } else {
    const factory = (block: IQueryBuildingBlock<R>) => {
      const queryConstructor: IQueryConstructor<R, T> = query.constructor as any
      return new queryConstructor(block)
    }
    return new ArrayQuery<R, T>(buildingBlock, factory)
  }
}

export type MultipleElementsQuery = ArrayQuery<HTMLElement>
