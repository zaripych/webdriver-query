import { ConditionQuery, PromiseLikeQuery } from '../query'

import { INumberQuery } from '../../shared/query'

export class NumberQuery extends PromiseLikeQuery<number> implements INumberQuery {
  public equals(value: number): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('equals', value)))
  }

  public greaterThan(value: number): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('greaterThan', value)))
  }

  public lessThan(value: number): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('lessThan', value)))
  }

  public greaterThanOrEqual(value: number): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('greaterThanOrEqual', value)))
  }

  public lessThanOrEqual(value: number): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('lessThanOrEqual', value)))
  }

  public whenRejected(value: number): NumberQuery {
    return new NumberQuery(this.build(this.appendCall('whenRejected', value)))
  }

  public perform(): Promise<number> {
    return this.executor.perform<number>(this.query) as Promise<number>
  }

  private appendCall(name: keyof INumberQuery, ...args: Array<{}>) {
    return this.query.appendCall(name, ...args)
  }
}
