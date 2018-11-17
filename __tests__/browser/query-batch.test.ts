import { describeBrowserTests } from '../utils/browser-tests-config';
import { Query } from '../../src/node/query';
import { NoSuchElementError } from '../../src/shared/errors';

describe('Query.batch', () => {
  describeBrowserTests((testDataBuilder) => {
    let baseQuery: Query;
    beforeAll(async () => {
      const result = await testDataBuilder();
      baseQuery = result.query;
    });

    describe('given a query that fulfills all properties', async () => {
      const query = () => {
        return baseQuery.batch((q) => ({
          name: q.findElement('#multiple-elements .row .column-name').getText(),
          age: q.findElement('#multiple-elements .row .column-age').getText()
        }));
      };

      it('should resolve', async () => {
        const result = await query();

        expect(result).toEqual({
          name: 'Mark',
          age: '2.5'
        });
      });
    });

    describe('given an element sub-query that fulfills all properties', async () => {
      const query = () => {
        return baseQuery.findElement('#multiple-elements .row').batch((q) => ({
          name: q.findElement('.column-name').getText(),
          age: q.findElement('.column-age').getText()
        }));
      };

      it('should resolve', async () => {
        const result = await query();

        expect(result).toEqual({
          name: 'Mark',
          age: '2.5'
        });
      });
    });

    describe('given a query that rejects one of the properties', async () => {
      const query = () => {
        return baseQuery.batch((q) => ({
          name: q.findElement('#multiple-elements .row .column-name').getText(),
          age: q.findElement('#multiple-elements #row .column-age').getText()
        }));
      };

      it('should reject', async () => {
        try {
          await query();
          fail('Should throw!');
        } catch (err) {
          expect(err).toBeInstanceOf(NoSuchElementError);
        }
      });
    });

    describe('given an element sub-query that rejects one of the properties', async () => {
      const query = () => {
        return baseQuery.findElement('#multiple-elements .row').batch((q) => ({
          name: q.findElement('.column-name').getText(),
          age: q.findElement('#column-age').getText()
        }));
      };

      it('should reject', async () => {
        try {
          await query();
          fail('Should throw!');
        } catch (err) {
          expect(err).toBeInstanceOf(NoSuchElementError);
        }
      });
    });

    describe(
      'given an element sub-query that rejects' +
        ' one of the properties but has whenRejected query',
      async () => {
        const query = () => {
          return baseQuery.findElement('#multiple-elements .row').batch((q) => ({
            name: q.findElement('.column-name').getText(),
            age: q
              .findElement('#column-age')
              .getText()
              .whenRejected('')
          }));
        };

        it('should reject', async () => {
          const result = await query();

          expect(result).toEqual({
            name: 'Mark',
            age: ''
          });
        });
      }
    );
  });
});
