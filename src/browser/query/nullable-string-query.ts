import { BaseQuery } from './base-query'
import { StringQuery } from './string-query'
import { ConditionQuery } from './condition-query'
import { QueryBuilder, INullableStringQuery, INumberConversionOptions } from '../../shared/query'
import { NumberQuery } from './number-query'
import { ArgumentError } from '../../shared/errors'

export class NullableStringQuery extends BaseQuery<string | null> implements INullableStringQuery {
  public length(): NumberQuery {
    const query = this.appendCall('length')
    return new NumberQuery(
      this.build(() => {
        return this.perform().then(resolvedValue => {
          return (resolvedValue && resolvedValue.length) || 0
        })
      }, query)
    )
  }

  public toNumber(opts?: INumberConversionOptions): NumberQuery {
    const { float, radix } = opts || { float: true, radix: 10 }
    const query = this.appendCall('toNumber', ...(opts ? [opts] : []))
    return new NumberQuery(
      this.build(() => {
        return this.perform().then(resolvedValue => {
          if (!resolvedValue) {
            throw new ArgumentError(`Cannot convert ${resolvedValue} to a number`, query)
          }

          const result = float ? parseFloat(resolvedValue) : parseInt(resolvedValue, radix || 10)

          if (typeof result !== 'number' || Number.isNaN(result)) {
            throw new ArgumentError(`Cannot convert \'${resolvedValue}\' to a number`, query)
          }

          return result
        })
      }, query)
    )
  }

  public equals(value: string | null): ConditionQuery {
    const query = this.query.appendCall('equals', value)
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(text => {
          return text === value
        })
      }, query)
    )
  }

  public matches(regularExpression: RegExp | string): ConditionQuery {
    const query = this.query.appendCall('matches', regularExpression)
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(text => {
          if (typeof regularExpression === 'string') {
            return text !== null && new RegExp(regularExpression).test(text)
          } else {
            return text !== null && regularExpression.test(text)
          }
        })
      }, query)
    )
  }

  public notEmptyOrNull(): ConditionQuery {
    const query = this.query.appendCall('notEmptyOrNull')
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(text => {
          return !!text
        })
      }, query)
    )
  }

  public whenRejected(value: string): NullableStringQuery {
    const query = this.appendCall('whenRejected', value)
    return this.create(
      this.build(() => {
        return this.perform().catch(err => {
          this.logger.debug(() => [`whenRejected, ignoring error`, err])
          return value
        })
      }, query)
    )
  }

  public whenRejectedOrFalsy(value: string): StringQuery {
    const query = this.appendCall('whenRejectedOrFalsy', value)
    return new StringQuery(
      this.build(() => {
        return this.perform()
          .then(resolvedValue => {
            return resolvedValue || value
          })
          .catch(err => {
            this.logger.debug(() => [`whenRejectedOrFalsy, ignoring error`, err])
            return value
          })
      }, query)
    )
  }

  private appendCall(name: keyof INullableStringQuery, ...args: Array<{}>): QueryBuilder {
    return this.query.appendCall(name, ...args)
  }
}
