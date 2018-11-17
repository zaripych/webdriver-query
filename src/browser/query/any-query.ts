import * as Errors from '../../shared/errors'
import { IAnyQuery, QueryBuilder, AnyResultType } from '../../shared/query'
import { BaseQuery, IQueryBuildingBlock } from './base-query'
import { StringQuery } from './string-query'
import { ObjectQuery } from './object-query'
import { ElementQuery } from './element-query'
import { ConditionQuery } from './condition-query'

export class AnyQuery extends BaseQuery<AnyResultType> implements IAnyQuery {
  constructor(buildInfo: IQueryBuildingBlock<AnyResultType>) {
    super(buildInfo)
  }

  public asString(): StringQuery {
    const query = this.appendCall('asString')
    return new StringQuery(
      this.build(() => {
        return this.perform().then(value => {
          const type = typeof value
          if (typeof value !== 'string') {
            throw new Errors.UnexpectedTypeError(
              `The tested value is not a string, the type was resolved to '${type}'`,
              query
            )
          }
          return value
        })
      }, query)
    )
  }

  public asObject(): ObjectQuery {
    const query = this.appendCall('asObject')
    return new ObjectQuery(
      this.build(() => {
        return this.perform().then(value => {
          const type = typeof value
          if (!value) {
            throw new Errors.UnexpectedTypeError(
              'The tested value is not an object, ' + `the value is '${value}'`,
              query
            )
          }
          if (typeof value !== 'object') {
            throw new Errors.UnexpectedTypeError(
              'The tested value is not an object, ' + `the type was resolved to '${type}'`,
              query
            )
          }
          if (this.library.isDomElement(value)) {
            throw new Errors.UnexpectedTypeError(
              'The tested value is an element where a plain object was expected',
              query
            )
          }
          return value
        })
      }, query)
    )
  }

  public asElement(): ElementQuery {
    const query = this.appendCall('asElement')
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(value => {
          const type = typeof value
          if (!this.library.isDomElement(value)) {
            throw new Errors.UnexpectedTypeError(
              'The tested value is not an element, ' + `the type was resolved to '${type}'`,
              query
            )
          }
          return value
        })
      }, query)
    )
  }

  public asBoolean(): ConditionQuery {
    const query = this.appendCall('asBoolean')
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(value => {
          const type = typeof value
          if (typeof value !== 'boolean') {
            throw new Errors.UnexpectedTypeError(
              'The tested value is not a boolean, ' + `the type was resolved to '${type}'`,
              query
            )
          }
          return value
        })
      }, query)
    )
  }

  public truthy(): ConditionQuery {
    const query = this.appendCall('truthy')
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(value => {
          return !!value
        })
      }, query)
    )
  }

  private appendCall(name: keyof IAnyQuery, ...args: Array<{}>): QueryBuilder {
    return this.query.appendCall(name, ...args)
  }
}
