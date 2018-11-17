import { QueryBuilder, IConfig, IAsyncLogger } from '../../shared';
import { DomLibrary } from '../dom-library';
import { perform } from './perform';

export interface IQueryConstructor<T, Q> {
  new (block: IQueryBuildingBlock<T>): Q;
}

export interface IBuildingBlock {
  query: QueryBuilder;
  config: Readonly<IConfig>;
  library: DomLibrary;
  logger: IAsyncLogger;
}

export interface IQueryBuildingBlock<T> extends IBuildingBlock {
  executor: () => Promise<T>;

  [key: string]: any;
}

export const build = <Y, T>(
  buildingBlock: Readonly<IQueryBuildingBlock<T>>,
  executor: () => Promise<Y>,
  query: QueryBuilder
): Readonly<IQueryBuildingBlock<Y>> => {
  return Object.freeze({
    executor,
    query,
    config: buildingBlock.config,
    library: buildingBlock.library,
    logger: buildingBlock.logger
  });
};

export class QueryBuildingBlock<T> implements IQueryBuildingBlock<T> {
  public readonly query: QueryBuilder;
  public readonly config: Readonly<IConfig>;
  public readonly library: DomLibrary;
  public readonly executor: () => Promise<T>;
  public readonly logger: IAsyncLogger;

  [key: string]: any;

  constructor(props: IQueryBuildingBlock<T>) {
    this.query = props.query;
    this.config = props.config;
    this.library = props.library;
    this.executor = props.executor;
    this.logger = props.logger;
  }

  public build<Y>(executor: () => Promise<Y>, query: QueryBuilder) {
    return build<Y, T>(this, executor, query);
  }

  public perform(): Promise<T> {
    return perform(this.executor, this.query);
  }
}

const isBuildingBlock = (value: any): value is IBuildingBlock => {
  return (
    value &&
    typeof value === 'object' &&
    'library' in value &&
    'query' in value &&
    value.query instanceof QueryBuilder
  );
};

export const isQueryBuildingBlock = <T>(
  value: any
): value is IQueryBuildingBlock<T> => {
  return isBuildingBlock(value) && 'executor' in value;
};
