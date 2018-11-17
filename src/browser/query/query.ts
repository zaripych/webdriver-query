import * as Errors from '../../shared/errors';
import {
  IQueryDriver,
  IConfig,
  QueryBuilder,
  Selector,
  AnyResultType,
  noOpLogger,
  consoleLogger
} from '../../shared';
import {
  IQueryBuildingBlock,
  isQueryBuildingBlock,
  QueryBuildingBlock
} from './query-building-block';
import { AnyQuery } from './any-query';
import { ConditionQuery } from './condition-query';
import { ElementQuery } from './element-query';
import { DomLibrary } from '../dom-library';
import { OneOfQueries } from './one-of-query';
import { defaultConfig, validateConfig } from './config';
import { IInstanceWaitOptions, queryWaitOnce } from './wait';
import { evaluate } from './evaluate';
import { ArrayQuery, createArrayQuery } from './array-query';

export class Query implements IQueryDriver {
  public static ErrorLike = Errors.ErrorLike;

  public buildingBlock: QueryBuildingBlock<void>;

  constructor(arg?: Partial<IConfig> | Partial<IQueryBuildingBlock<void>>) {
    const buildingBlock: Partial<IQueryBuildingBlock<void>> =
      (isQueryBuildingBlock<void>(arg) && arg) || {};
    const passedConfig: Partial<IConfig> = {};
    if (arg) {
      Object.keys(defaultConfig).reduce((filtered, key) => {
        const value = arg[key];
        if (typeof value === 'number' || typeof value === 'boolean') {
          filtered[key] = value;
        }
        return filtered;
      }, passedConfig);
    }
    const effectiveConfig: IConfig = {
      ...defaultConfig,
      ...passedConfig
    };
    validateConfig(effectiveConfig);
    this.buildingBlock = new QueryBuildingBlock({
      executor:
        (buildingBlock && buildingBlock.executor) || (() => Promise.resolve()),
      query:
        (buildingBlock && buildingBlock.query) ||
        new QueryBuilder().appendCall(
          QueryBuilder.constructorName,
          effectiveConfig
        ),
      library: (buildingBlock && buildingBlock.library) || new DomLibrary(),
      config: Object.freeze(effectiveConfig),
      logger: effectiveConfig.shouldLog ? consoleLogger() : noOpLogger
    });
  }

  public findElements(
    selector: Selector
  ): ArrayQuery<HTMLElement, ElementQuery> {
    const query = this.buildingBlock.query.appendCall('findElements', selector);
    return createArrayQuery(
      this.build(() => {
        return this.whenReady().then(() =>
          this.buildingBlock.library.select(selector, null, query)
        );
      }, query),
      block => new ElementQuery(block)
    );
  }

  public findElement(selector: Selector): ElementQuery {
    const query = this.buildingBlock.query.appendCall('findElement', selector);
    return new ElementQuery(
      this.build(() => {
        return this.whenReady().then(() =>
          Promise.resolve(
            this.buildingBlock.library.selectFirst(selector, null, query)
          )
        );
      }, query)
    );
  }

  public execute<T extends AnyResultType>(
    script: string | ((...args: any[]) => T),
    ...args: any[]
  ): AnyQuery {
    const query = this.buildingBlock.query.appendCall(
      'execute',
      ...[script, ...args]
    );
    return new AnyQuery(
      this.build(() => {
        return this.whenReady().then(() => {
          return evaluate(script, ...args);
        });
      }, query)
    );
  }

  public sequence<I extends OneOfQueries, T extends I[]>(
    queries: (q: this) => T
  ): Query {
    const query = this.buildingBlock.query.appendCall('sequence', queries);
    const allQueries = queries(this);
    const iterate = (index: number): Promise<void> => {
      if (index < 0 || index >= allQueries.length) {
        return Promise.resolve();
      }
      const q = allQueries[index];
      return (q.perform() as Promise<void>).then(() => {
        return iterate(index + 1);
      });
    };
    return new ThenableQuery(
      this.build(() => {
        return iterate(0).then(() => {
          return Promise.resolve();
        });
      }, query)
    );
  }

  public waitUntil(
    condition: (q: Query) => ConditionQuery,
    waitOptions?: IInstanceWaitOptions
  ): Query {
    const query = this.buildingBlock.query.appendCall(
      'waitUntil',
      ...(waitOptions ? [condition, waitOptions] : [condition])
    );
    const q = condition(this);
    const waitOnce = queryWaitOnce(
      () => this.whenReady(),
      () => q.perform(),
      this.effectiveWaitOptions(waitOptions),
      query,
      this.buildingBlock.logger
    );
    return new ThenableQuery(this.build(waitOnce, query));
  }

  protected whenReady(): Promise<void> {
    return this.buildingBlock.perform();
  }

  private build<Y>(
    executor: () => Promise<Y>,
    query: QueryBuilder
  ): IQueryBuildingBlock<Y> {
    return this.buildingBlock.build(executor, query);
  }

  private effectiveWaitOptions(
    waitOptions?: IInstanceWaitOptions
  ): { timeout: number; pollPeriod: number } {
    const config = this.buildingBlock.config;
    const effectiveTimeout =
      (waitOptions && waitOptions.timeout) || config.waitTimeoutMilliseconds;
    const effectivePollPeriod =
      (waitOptions && waitOptions.pollPeriod) ||
      Math.max(
        config.minPollPeriodMilliseconds,
        effectiveTimeout / config.pollTimes
      );
    return {
      timeout: effectiveTimeout,
      pollPeriod: effectivePollPeriod
    };
  }
}

// tslint:disable:max-classes-per-file

export class ThenableQuery extends Query {
  public perform(): Promise<void> {
    return this.whenReady();
  }
}
