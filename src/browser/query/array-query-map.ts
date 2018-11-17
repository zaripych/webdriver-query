import { IBaseQuery } from './base-query';
import {
  ArrayQuery,
  createArrayQueryForSingleElementQuery
} from './array-query';
import { ResultOfQuery } from './result-of-query';

declare module './array-query' {
  // tslint:disable-next-line:interface-name
  interface ArrayQuery<E, Eq> {
    map<T extends IBaseQuery<any>>(
      query: (q: Eq) => T
    ): ArrayQuery<ResultOfQuery<T>, T>;
  }
}

ArrayQuery.prototype.map = function<T extends IBaseQuery<any>>(
  this: ArrayQuery<any, any>,
  q: (q: any) => T
) {
  const query = this.query.appendCall('map', q);

  const firstItemQuery = this.at(0);
  const mappedQuery = q(firstItemQuery);

  return createArrayQueryForSingleElementQuery(
    mappedQuery,
    this.buildingBlock.build(() => {
      return this.perform().then(items => {
        if (items.length === 0) {
          return Promise.resolve([]);
        }

        const mappedItems: any[] = [];
        let index = 0;
        const iterate = (): Promise<any[]> => {
          if (index < 0 || index >= items.length) {
            return Promise.resolve(mappedItems);
          }

          const itemQueryBuilder = this.query.appendCall('at', index);
          const itemQuery = this.itemQueryFactory(
            this.buildingBlock.build(
              () => Promise.resolve(items[index]),
              itemQueryBuilder
            )
          );
          const mapped = q(itemQuery);

          return mapped.perform().then(value => {
            mappedItems.push(value);
            index++;
            return iterate();
          });
        };

        return iterate();
      });
    }, query)
  );
};
