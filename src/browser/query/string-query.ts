import { BaseQuery, IQueryBuildingBlock } from './base-query';
import {
  QueryBuilder,
  IStringQuery,
  INumberConversionOptions
} from '../../shared/query';

import { ConditionQuery } from './condition-query';
import { NumberQuery } from './number-query';
import { ArgumentError } from '../../shared/errors';

export class StringQuery extends BaseQuery<string> implements IStringQuery {
  constructor(buildInfo: IQueryBuildingBlock<string>) {
    super(buildInfo);
  }

  public length(): NumberQuery {
    const query = this.appendCall('length');
    return new NumberQuery(
      this.build(() => {
        return this.perform().then(resolvedValue => {
          return resolvedValue.length;
        });
      }, query)
    );
  }

  public toNumber(opts?: INumberConversionOptions): NumberQuery {
    const { float, radix } = opts || { float: true, radix: 10 };
    const query = this.appendCall('toNumber', ...(opts ? [opts] : []));
    return new NumberQuery(
      this.build(() => {
        return this.perform().then(resolvedValue => {
          if (!resolvedValue) {
            throw new ArgumentError(
              `Cannot convert ${resolvedValue} to a number`,
              query
            );
          }

          const result = float
            ? parseFloat(resolvedValue)
            : parseInt(resolvedValue, radix || 10);

          if (typeof result !== 'number' || Number.isNaN(result)) {
            throw new ArgumentError(
              `Cannot convert \'${resolvedValue}\' to a number`,
              query
            );
          }

          return result;
        });
      }, query)
    );
  }

  public equals(value: string): ConditionQuery {
    const query = this.appendCall('equals', value);
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(resolvedValue => {
          return resolvedValue === value;
        });
      }, query)
    );
  }

  public matches(expression: RegExp | string): ConditionQuery {
    const query = this.appendCall('matches', expression);
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(resolvedValue => {
          if (typeof expression === 'string') {
            return (
              resolvedValue !== null &&
              new RegExp(expression).test(resolvedValue)
            );
          } else {
            return resolvedValue !== null && expression.test(resolvedValue);
          }
        });
      }, query)
    );
  }

  public notEmpty(): ConditionQuery {
    const query = this.appendCall('notEmpty');
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(resolvedValue => {
          return resolvedValue !== '';
        });
      }, query)
    );
  }

  public whenRejected(value: string): StringQuery {
    const query = this.appendCall('whenRejected', value);
    return this.create(
      this.build(() => {
        return this.perform().catch(err => {
          this.logger.debug(() => [`whenRejected, ignoring error`, err]);
          return value;
        });
      }, query)
    );
  }

  public whenRejectedOrFalsy(value: string): StringQuery {
    const query = this.appendCall('whenRejectedOrFalsy', value);
    return this.create(
      this.build(() => {
        return this.perform()
          .then(resolvedValue => {
            return resolvedValue || value;
          })
          .catch(err => {
            this.logger.debug(() => [
              `whenRejectedOrFalsy, ignoring error`,
              err
            ]);
            return value;
          });
      }, query)
    );
  }

  private appendCall(
    name: keyof IStringQuery,
    ...args: Array<{}>
  ): QueryBuilder {
    return this.query.appendCall(name, ...args);
  }
}
