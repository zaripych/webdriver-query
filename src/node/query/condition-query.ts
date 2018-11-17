import { IQueryBuildingBlock, PromiseLikeQuery } from '../query'
import { IConditionQuery } from '../../shared/query'

export class ConditionQuery extends PromiseLikeQuery<boolean> implements IConditionQuery {
  constructor(buildInfo: IQueryBuildingBlock) {
    super(buildInfo)
  }

  public not(): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('not')))
  }

  public whenRejected(value: boolean): ConditionQuery {
    return new ConditionQuery(this.build(this.appendCall('whenRejected', value)))
  }

  private appendCall(name: keyof IConditionQuery, ...args: Array<{}>) {
    return this.query.appendCall(name, ...args)
  }
}
