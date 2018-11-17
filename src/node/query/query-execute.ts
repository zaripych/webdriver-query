import { PromiseLikeQuery } from './base-query';
import { AnyResultType } from '../../shared/query';
import { AnyQuery } from './any-query';

declare module './base-query' {
  // tslint:disable-next-line:interface-name
  interface PromiseLikeQuery<T> {
    execute<U extends AnyResultType>(
      script: string | ((value: T, ...args: any[]) => U),
      ...args: any[]
    ): AnyQuery;
  }
}

PromiseLikeQuery.prototype.execute = function execute<
  T,
  U extends AnyResultType
>(
  this: PromiseLikeQuery<T>,
  script: string | ((value: T, ...args: any[]) => U),
  ...args: any[]
) {
  const query = this.query.appendCall('execute', ...[script, ...args]);
  return new AnyQuery(this.build(query));
};
