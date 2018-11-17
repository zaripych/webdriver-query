import { BaseQuery, IQueryBuildingBlock } from './base-query'
import { IConditionQuery } from '../../shared/query'

export class ConditionQuery extends BaseQuery<boolean> implements IConditionQuery {
  constructor(buildInfo: IQueryBuildingBlock<boolean>) {
    super(buildInfo)
  }

  public not(): ConditionQuery {
    return new ConditionQuery(
      this.build(() => this.perform().then(value => !value), this.appendCall('not'))
    )
  }

  public whenRejected(value: boolean): ConditionQuery {
    return new ConditionQuery(
      this.build(
        () =>
          this.perform().catch(err => {
            this.logger.debug(() => [`whenRejected, ignoring error`, err])
            return value
          }),
        this.appendCall('whenRejected', value)
      )
    )
  }

  private appendCall(name: keyof IConditionQuery, ...args: Array<{}>) {
    return this.query.appendCall(name, ...args)
  }
}
