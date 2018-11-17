import { IInstanceWaitOptions } from '../../shared/query';
import { ConditionQuery } from './condition-query';

// tslint:disable:interface-name

declare module './base-query' {
  interface BaseQuery {
    waitUntil(
      condition: (q: this) => ConditionQuery,
      waitOptions?: IInstanceWaitOptions
    ): this;

    retry(waitOptions?: IInstanceWaitOptions): this;
  }
}
