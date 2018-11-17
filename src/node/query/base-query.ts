import { QueryExecutor } from './query-executor'
import {
  QueryBuilder,
  ArgumentError,
  IAsyncLogger,
  IPromise,
  OnFulfilled,
  OnRejected,
  IQuery,
} from '../../shared'
import { IQueryBuildingBlock, IQueryConstructor } from './query-building-block'
import { PageReloadedError } from '../../shared/errors/page-reloaded-error'
import { LibraryInstaller } from '../library-installer'

export { IQueryBuildingBlock, IQueryConstructor }

export class BaseQuery {
  public readonly query: QueryBuilder
  protected readonly executor: QueryExecutor
  protected readonly logger: IAsyncLogger
  protected readonly installer: LibraryInstaller

  constructor(buildingBlock: IQueryBuildingBlock) {
    /* istanbul ignore next */
    if (!buildingBlock) {
      throw new ArgumentError('Building block is mandatory to construct a new query')
    }
    this.executor = buildingBlock.executor
    this.query = buildingBlock.query
    this.logger = buildingBlock.logger
    this.installer = buildingBlock.installer
  }

  public build(query: QueryBuilder): IQueryBuildingBlock {
    return {
      installer: this.installer,
      logger: this.logger,
      executor: this.executor,
      query,
    }
  }

  public create(buildingBlock: IQueryBuildingBlock): this {
    const constructor = this.constructor as IQueryConstructor<this>
    return new constructor(buildingBlock)
  }
}

// tslint:disable:max-classes-per-file

export interface IBaseQuery<T> extends IQuery {
  perform(): IPromise<T>
}

export class PromiseLikeQueryNoExecute<T, P extends IPromise<T> = Promise<T>> extends BaseQuery
  implements IBaseQuery<T> {
  constructor(buildingBlock: IQueryBuildingBlock) {
    super(buildingBlock)
  }

  public perform(): P {
    return (this.executor.perform<T>(this.query) as any) as P
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?: OnFulfilled<T, TResult1>,
    onrejected?: OnRejected<TResult2>
  ) {
    return this.perform().then(onfulfilled, onrejected)
  }

  public catch<TResult = never>(onrejected?: OnRejected<TResult>) {
    return this.perform().catch(onrejected)
  }

  public expectPageReload(timeoutMs: number = 1000) {
    return this.then(
      () => {
        return this.executor.waitForUnload(timeoutMs).then(() =>
          this.installer.isInstalled().then(isInstalled => {
            if (isInstalled) {
              throw new ArgumentError(
                'The page was expected to be reloaded. Did you trigger the reload?'
              )
            }
          })
        )
      },
      err => {
        if (err instanceof PageReloadedError) {
          return Promise.resolve()
        }
        return Promise.reject()
      }
    )
  }
}

export class PromiseLikeQuery<
  T,
  P extends IPromise<T> = Promise<T>
> extends PromiseLikeQueryNoExecute<T, P> {}
