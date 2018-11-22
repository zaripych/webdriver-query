import {
  StringQuery,
  ElementQuery,
  ConditionQuery,
  PromiseLikeQuery,
  ObjectQuery,
} from '../query'

import { QueryBuilder, IAnyQuery, AnyResultType } from '../../shared/query'

export class AnyQuery extends PromiseLikeQuery<AnyResultType>
  implements IAnyQuery {
  public asString(): StringQuery {
    const query = this.appendCall('asString')
    return new StringQuery(this.build(query))
  }

  public asObject<T extends object = {}>(): ObjectQuery<T> {
    const query = this.appendCall('asObject')
    return new ObjectQuery(this.build(query))
  }

  public asElement(): ElementQuery {
    const query = this.appendCall('asElement')
    return new ElementQuery(this.build(query))
  }

  public asBoolean(): ConditionQuery {
    const query = this.appendCall('asBoolean')
    return new ConditionQuery(this.build(query))
  }

  public truthy(): ConditionQuery {
    const query = this.appendCall('truthy')
    return new ConditionQuery(this.build(query))
  }

  private appendCall(
    method: keyof IAnyQuery,
    ...args: Array<{}>
  ): QueryBuilder {
    return this.query.appendCall(method, ...args)
  }
}
