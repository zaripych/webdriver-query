import { IQueryBuildingBlock, PromiseLikeQuery, IBaseQuery } from './base-query';
import { NumberQuery } from './number-query';
import { ConditionQuery } from './condition-query';
import { ArgumentError } from '../../shared/errors';
import { QueryForResultType, ResultOfQuery } from './result-of-query';
import { IQueryConstructor } from './query-building-block';
import { SubQueryInfo } from '../../shared';

export type QueryFactory<Q> = (buildingBlock: IQueryBuildingBlock) => Q;

export interface IArrayQueryConstructor<
  E,
  Eq = QueryForResultType<E>,
  ArrQ extends ArrayQuery<E, Eq> = ArrayQuery<E, Eq>
> {
  new (block: IQueryBuildingBlock, itemQueryFactory: QueryFactory<Eq>): ArrQ;
}

export class ArrayQuery<T, TItemQuery = QueryForResultType<T>> extends PromiseLikeQuery<T[]> {
  public readonly itemQueryFactory: QueryFactory<TItemQuery>;

  constructor(buildInfo: IQueryBuildingBlock, itemQueryFactory: QueryFactory<TItemQuery>) {
    /* istanbul ignore next */
    if (!itemQueryFactory) {
      throw new ArgumentError('itemQueryFactory is mandatory parameter for BaseArrayQuery');
    }

    super(buildInfo);

    this.itemQueryFactory = itemQueryFactory;
  }

  public count(): NumberQuery {
    const query = this.query.appendCall('count');
    return new NumberQuery(this.build(query));
  }

  public at(index: number): TItemQuery {
    const query = this.query.appendCall('at', index);
    return this.itemQueryFactory(this.build(query));
  }

  public filter(condition: (q: TItemQuery) => ConditionQuery): this {
    const query = this.query.appendCall('filter', new SubQueryInfo(this.at(0) as any, condition as any));
    return this.create(this.build(query));
  }

  public first(condition: (q: TItemQuery) => ConditionQuery): TItemQuery {
    const query = this.query.appendCall('first', new SubQueryInfo(this.at(0) as any, condition as any));
    return this.itemQueryFactory(this.build(query));
  }

  public indexOf(condition: (q: TItemQuery) => ConditionQuery): NumberQuery {
    const query = this.query.appendCall('indexOf', new SubQueryInfo(this.at(0) as any, condition as any));
    return new NumberQuery(this.build(query));
  }

  public map<R extends IBaseQuery<any>>(itemsQuery: (q: TItemQuery) => R): ArrayQuery<ResultOfQuery<R>, R> {
    const firstQuery = this.at(0);
    const mapQuery = itemsQuery(firstQuery);
    if (!mapQuery.constructor) {
      // tslint:disable-next-line:quotemark
      throw new ArgumentError("The query returned by map function doesn't have a constructor");
    }
    const mapQueryConstructor = mapQuery.constructor as IQueryConstructor<R>;

    const query = this.query.appendCall('map', new SubQueryInfo(firstQuery as any, itemsQuery as any));
    return new ArrayQuery(this.build(query), build => new mapQueryConstructor(build));
  }

  public create(buildingBlock: IQueryBuildingBlock): this {
    const constructor = this.constructor as IArrayQueryConstructor<T, TItemQuery, this>;
    return new constructor(buildingBlock, this.itemQueryFactory);
  }
}
