import { QueryExecutor } from '../query';
import { QueryBuilder, IAsyncLogger } from '../../shared';
import { LibraryInstaller } from '../library-installer';

export interface IQueryConstructor<Q> {
  new (buildingBlock: IQueryBuildingBlock): Q;
}

export interface IQueryBuildingBlock {
  query: QueryBuilder;
  executor: QueryExecutor;
  logger: IAsyncLogger;
  installer: LibraryInstaller;
}
