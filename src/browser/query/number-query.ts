import { BaseQuery, IQueryBuildingBlock } from './base-query';
import { QueryBuilder, INumberQuery } from '../../shared/query';

import { ConditionQuery } from './condition-query';

export class NumberQuery extends BaseQuery<number> implements INumberQuery {
  constructor(buildInfo: IQueryBuildingBlock<number>) {
    super(buildInfo);
  }

  public equals(value: number): ConditionQuery {
    const query = this.appendCall('equals', value);
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then((resolvedValue) => {
          return resolvedValue === value;
        });
      }, query)
    );
  }

  public greaterThan(value: number): ConditionQuery {
    const query = this.appendCall('greaterThan', value);
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then((resolvedValue) => {
          return resolvedValue > value;
        });
      }, query)
    );
  }

  public lessThan(value: number): ConditionQuery {
    const query = this.appendCall('lessThan', value);
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then((resolvedValue) => {
          return resolvedValue < value;
        });
      }, query)
    );
  }

  public greaterThanOrEqual(value: number): ConditionQuery {
    const query = this.appendCall('greaterThanOrEqual', value);
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then((resolvedValue) => {
          return resolvedValue >= value;
        });
      }, query)
    );
  }

  public lessThanOrEqual(value: number): ConditionQuery {
    const query = this.appendCall('lessThanOrEqual', value);
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then((resolvedValue) => {
          return resolvedValue <= value;
        });
      }, query)
    );
  }

  public whenRejected(value: number): NumberQuery {
    const query = this.appendCall('whenRejected', value);
    return new NumberQuery(
      this.build(() => {
        return this.perform().catch((err) => {
          this.logger.debug(() => [`whenRejected, ignoring error`, err]);
          return value;
        });
      }, query)
    );
  }

  private appendCall(
    name: keyof INumberQuery,
    ...args: Array<{}>
  ): QueryBuilder {
    return this.query.appendCall(name, ...args);
  }
}
