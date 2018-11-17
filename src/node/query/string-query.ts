import { ConditionQuery, PromiseLikeQuery, NumberQuery } from '../query'
import { IStringQuery, INumberConversionOptions } from '../../shared/query'

export class StringQuery extends PromiseLikeQuery<string> implements IStringQuery {
  public length(): NumberQuery {
    return new NumberQuery(this.build(this.appendCall('length')))
  }

  public toNumber(opts?: INumberConversionOptions): NumberQuery {
    return new NumberQuery(this.build(this.appendCall('toNumber', ...(opts ? [opts] : []))))
  }

  public equals(value: string): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('equals', value)))
  }

  public matches(expression: RegExp): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('matches', expression)))
  }

  public notEmpty(): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('notEmpty')))
  }

  public whenRejected(value: string): StringQuery {
    return new StringQuery(this.build(this.appendCall('whenRejected', value)))
  }

  public whenRejectedOrFalsy(value: string): StringQuery {
    return new StringQuery(this.build(this.appendCall('whenRejectedOrFalsy', value)))
  }

  private appendCall(name: keyof IStringQuery, ...args: Array<{}>) {
    return this.query.appendCall(name, ...args)
  }
}
