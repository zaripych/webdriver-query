import * as selenium from 'selenium-webdriver';
import { QueryExecutor } from './query-executor';
import {
  QueryBuilder,
  IConfig,
  IDriver,
  IQueryDriver,
  Selector,
  AnyResultType,
  IInstanceWaitOptions,
  noOpLogger,
  consoleLogger,
  OnFulfilled,
  OnRejected,
  IPromise,
  SubQueryInfo
} from '../../shared';
import { IQueryBuildingBlock } from './query-building-block';
import { locatorToSelector, isSeleniumLocator } from './locator-to-selector';
import { AnyQuery } from './any-query';
import { ElementQuery } from './element-query';
import { IBatchQuery, BatchQueryResult } from './query-batch';
import { ObjectQuery } from './object-query';
import { ConditionQuery } from './condition-query';
import { LibraryInstaller } from '../library-installer';
import { ArrayQuery } from './array-query';
import { OneOfQueries } from './one-of-query';

export interface IQueryConfig {
  shouldLogOnServer: boolean;
}

const filterConfig = (
  config?: Partial<IConfig & IQueryConfig>
): Partial<IConfig> | undefined => {
  if (!config) {
    return;
  }
  const { shouldLogOnServer, ...rest } = config;
  const filtered = {
    ...rest
  };
  if (Object.keys(filtered).length === 0) {
    return;
  }
  return filtered;
};

export class Query<
  TDriver extends IDriver = selenium.WebDriver,
  TElement = selenium.WebElement,
  TElementPromise extends IPromise<any> = selenium.WebElementPromise
> implements IQueryDriver {
  protected readonly queryBuildingBlock: IQueryBuildingBlock;
  protected readonly precondition: () => Promise<void>;

  protected get installer() {
    return this.queryBuildingBlock.installer;
  }

  public get query() {
    return this.queryBuildingBlock.query;
  }

  constructor(
    driver: TDriver | IDriver,
    config?: Partial<IConfig & IQueryConfig>,
    buildingBlock?: Partial<IQueryBuildingBlock>,
    installer?: LibraryInstaller,
    precondition?: () => Promise<void>
  ) {
    const logger =
      (buildingBlock && buildingBlock.logger) ||
      (config && config.shouldLogOnServer ? consoleLogger() : noOpLogger);

    const installerArg = installer || new LibraryInstaller(driver);

    this.precondition = precondition || (() => Promise.resolve());

    this.queryBuildingBlock = {
      installer: installerArg,
      executor:
        (buildingBlock && buildingBlock.executor) ||
        new QueryExecutor(
          driver,
          this.precondition,
          filterConfig(config),
          logger,
          installerArg.install.bind(installerArg)
        ),
      query: (buildingBlock && buildingBlock.query) || new QueryBuilder(),
      logger
    };
  }

  public get(url: string): ThenableQuery {
    const log = this.queryBuildingBlock.logger.debug(`query.get: ${url}`);

    let getResult: Promise<void> | null = null;

    const precondition = () => {
      if (getResult) {
        return getResult;
      }

      getResult = Promise.resolve().then(() =>
        this.queryBuildingBlock.executor.driver.get(url).then(() => {
          log.debug('checking if query browser library is installed');

          return this.installer.isInstalled().then(isInstalled => {
            if (!isInstalled) {
              log.debug('query browser library is not installed, installing');

              return this.installer.install().then(() => {
                log.debug('query browser library installation complete');
              });
            }

            log.debug('query browser library already installed');

            return Promise.resolve();
          });
        })
      );
      return getResult;
    };
    return this.create(precondition);
  }

  public findElements(
    selector: Selector | selenium.By
  ): ArrayQuery<TElement, ElementQuery<TElement, TElementPromise>> {
    if (isSeleniumLocator(selector)) {
      return this.findElements(locatorToSelector(selector));
    }

    const query = this.queryBuildingBlock.query.appendCall(
      'findElements',
      selector
    );

    return new ArrayQuery(
      this.build(query),
      build => new ElementQuery<TElement, TElementPromise>(build)
    );
  }

  public findElement(
    selector: Selector | selenium.By
  ): ElementQuery<TElement, TElementPromise> {
    if (isSeleniumLocator(selector)) {
      return this.findElement(locatorToSelector(selector));
    }

    const query = this.queryBuildingBlock.query.appendCall(
      'findElement',
      selector
    );

    return new ElementQuery<TElement, TElementPromise>(this.build(query));
  }

  public execute<T extends AnyResultType>(
    script: string | ((...args: any[]) => T),
    ...args: any[]
  ): AnyQuery {
    const query = this.queryBuildingBlock.query.appendCall(
      'execute',
      ...[script, ...args]
    );
    return new AnyQuery(this.build(query));
  }

  public batch<Y extends IBatchQuery>(
    subQueries: ((q: this) => Y)
  ): ObjectQuery<BatchQueryResult<Y>> {
    const query = this.queryBuildingBlock.query.appendCall(
      'batch',
      new SubQueryInfo(this, subQueries as any)
    );
    return new ObjectQuery<BatchQueryResult<Y>>(this.build(query));
  }

  public sequence<
    I extends OneOfQueries,
    T extends Array<I | false | undefined | null>
  >(queries: (q: this) => T) {
    const filter = (self: this) => queries(self).filter(value => !!value);
    const query = this.queryBuildingBlock.query.appendCall(
      'sequence',
      new SubQueryInfo(this, filter as any)
    );
    return this.create(query);
  }

  public waitUntil(
    condition: (q: Query) => ConditionQuery,
    waitOptions?: IInstanceWaitOptions
  ): Query {
    const conditionSubQuery = new SubQueryInfo(this, condition as any);
    const query = this.queryBuildingBlock.query.appendCall(
      'waitUntil',
      ...(!waitOptions ? [conditionSubQuery] : [conditionSubQuery, waitOptions])
    );
    return this.create(query);
  }

  protected build(queryBuilder: QueryBuilder): IQueryBuildingBlock {
    return {
      installer: this.queryBuildingBlock.installer,
      logger: this.queryBuildingBlock.logger,
      executor: this.queryBuildingBlock.executor,
      query: queryBuilder
    };
  }

  protected create(arg: QueryBuilder | (() => Promise<void>)) {
    const precondition = typeof arg === 'function' ? arg : undefined;
    const query = arg instanceof QueryBuilder ? arg : undefined;
    if (precondition || query) {
      return new ThenableQuery(
        this.queryBuildingBlock.executor.driver,
        this.queryBuildingBlock.executor.config,
        query ? this.build(query) : this.queryBuildingBlock,
        this.installer,
        precondition
      );
    } else {
      throw new Error('The argument should be either query or precondition');
    }
  }
}

// tslint:disable:max-classes-per-file

export class ThenableQuery extends Query {
  public perform(): Promise<void> {
    if (this.queryBuildingBlock.query.numberOfCalls > 0) {
      return this.queryBuildingBlock.executor.perform(
        this.queryBuildingBlock.query
      );
    } else {
      return this.precondition();
    }
  }

  public then(
    onfulfilled?: OnFulfilled<void, void>,
    onrejected?: OnRejected<void>
  ) {
    return this.perform().then(onfulfilled, onrejected);
  }

  public catch<TResult = never>(onrejected?: OnRejected<TResult>) {
    return this.perform().catch(onrejected);
  }
}
