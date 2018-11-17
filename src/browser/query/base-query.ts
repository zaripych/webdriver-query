import { QueryBuilder, IAsyncLogger, hasQueryBuilder } from '../../shared'
import { DomLibrary } from '../dom-library'
import { ConditionQuery } from './condition-query'
import { IInstanceWaitOptions, queryWaitOnce } from './wait'
import { IQueryConstructor, IQueryBuildingBlock, QueryBuildingBlock } from './query-building-block'

export function isQuery<T>(q: any): q is IBaseQuery<T> {
  return (
    q &&
    typeof q === 'object' &&
    'perform' in q &&
    typeof q.perform === 'function' &&
    hasQueryBuilder(q)
  )
}

export interface IBaseQuery<T> {
  perform(): Promise<T>
}

export class BaseQuery<T> implements IBaseQuery<T> {
  public readonly name: string

  public buildingBlock: QueryBuildingBlock<T>

  constructor(block: IQueryBuildingBlock<T>) {
    this.buildingBlock = new QueryBuildingBlock(block)
    this.name = this.constructor.name
  }

  public perform(): Promise<T> {
    const logger = this.logger.debug(() => `perform: ${this.query.buildDescription(1)}`)
    return this.buildingBlock
      .perform()
      .then(value => {
        logger.debug(() => `success: ${value}`)
        return value
      })
      .catch(err => {
        logger.debug(() => `failure: ${err}`)
        return Promise.reject(err)
      })
  }

  public retry(waitOptions?: IInstanceWaitOptions): this {
    const query = this.query.appendCall('retry', ...(waitOptions ? [waitOptions] : []))
    const waitOnce = queryWaitOnce(
      () => this.perform(),
      () => this.perform(),
      this.effectiveWaitOptions(waitOptions),
      query,
      this.logger
    )
    return this.create(this.build(waitOnce, query))
  }

  public waitUntil(
    condition: (q: this) => ConditionQuery,
    waitOptions?: IInstanceWaitOptions
  ): this {
    const query = this.query.appendCall(
      'waitUntil',
      ...(waitOptions ? [condition, waitOptions] : [condition])
    )
    const q = condition(this)
    const waitOnce = queryWaitOnce(
      () => this.perform(),
      () => q.perform(),
      this.effectiveWaitOptions(waitOptions),
      query,
      this.logger
    )
    return this.create(this.build(waitOnce, query))
  }

  public create(block: IQueryBuildingBlock<T>): this {
    const constructor = this.constructor as IQueryConstructor<T, this>
    return new constructor(block)
  }

  protected build<Y>(executor: () => Promise<Y>, query: QueryBuilder): IQueryBuildingBlock<Y> {
    return this.buildingBlock.build(executor, query)
  }

  public get query(): QueryBuilder {
    return this.buildingBlock.query
  }

  protected get library(): DomLibrary {
    return this.buildingBlock.library
  }

  protected get logger(): IAsyncLogger {
    return this.buildingBlock.logger
  }

  private effectiveWaitOptions(
    waitOptions?: IInstanceWaitOptions
  ): { timeout: number; pollPeriod: number } {
    const config = this.buildingBlock.config
    const effectiveTimeout = (waitOptions && waitOptions.timeout) || config.waitTimeoutMilliseconds
    const effectivePollPeriod =
      (waitOptions && waitOptions.pollPeriod) ||
      Math.max(config.minPollPeriodMilliseconds, effectiveTimeout / config.pollTimes)
    return {
      timeout: effectiveTimeout,
      pollPeriod: effectivePollPeriod,
    }
  }
}

export { IQueryBuildingBlock, IQueryConstructor }
