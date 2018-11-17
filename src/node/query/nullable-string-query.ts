import {
  ConditionQuery,
  StringQuery,
  PromiseLikeQuery,
  NumberQuery
} from '../query';
import {
  INullableStringQuery,
  INumberConversionOptions
} from '../../shared/query';

export class NullableStringQuery extends PromiseLikeQuery<string | null>
  implements INullableStringQuery {
  public length(): NumberQuery {
    return new NumberQuery(this.build(this.appendCall('length')));
  }

  public toNumber(opts?: INumberConversionOptions): NumberQuery {
    return new NumberQuery(
      this.build(this.appendCall('toNumber', ...(opts ? [opts] : [])))
    );
  }

  public equals(value: string | null): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('equals', value)));
  }

  public matches(expression: RegExp): ConditionQuery {
    return new ConditionQuery(
      this.build(this.appendCall('matches', expression))
    );
  }

  public notEmptyOrNull(): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('notEmptyOrNull')));
  }

  public whenRejected(value: string): NullableStringQuery {
    return new NullableStringQuery(
      this.build(this.appendCall('whenRejected', value))
    );
  }

  public whenRejectedOrFalsy(value: string): StringQuery {
    return new StringQuery(
      this.build(this.appendCall('whenRejectedOrFalsy', value))
    );
  }

  private appendCall(
    name: keyof INullableStringQuery,
    ...args: Array<{} | null>
  ) {
    return this.query.appendCall(name, ...args);
  }
}
