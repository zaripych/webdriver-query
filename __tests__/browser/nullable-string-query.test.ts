import 'css.escape';
import { describeBrowserTests } from '../utils/browser-tests-config';
import { Query, NullableStringQuery } from '../../src/node/query';
import { NoSuchElementError, ArgumentError } from '../../src/shared/errors';

describe('NullableStringQuery', () => {
  describeBrowserTests((testDataBuilder) => {
    let baseQuery: Query;
    beforeAll(async () => {
      const result = await testDataBuilder();
      baseQuery = result.query;
    });

    describe('given a string query that resolves to a number', () => {
      let query: NullableStringQuery;
      beforeAll(async () => {
        query = baseQuery.findElement('#idNum').getAttribute('data-float');
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe('3.14');
      });

      describe('toNumber', () => {
        it('should resolve', async () => {
          const result = await query.toNumber();
          expect(result).toBe(3.14);
        });

        it('should resolve as number', async () => {
          const result = await query.toNumber({ float: false });
          expect(result).toBe(3);
        });
      });
    });

    describe('given a string query that resolves', () => {
      let query: NullableStringQuery;
      beforeAll(async () => {
        query = baseQuery
          .findElement('#value-attribute-0')
          .getAttribute('value');
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe('Something');
      });

      describe('matches', () => {
        it('should resolve to true when regex is valid and matches', async () => {
          const result = await query.matches(/something/i).perform();
          expect(result).toBe(true);
        });

        it('should resolve to false when regex is valid and doesn\'t match', async () => {
          const result = await query.matches(/something/).perform();
          expect(result).toBe(false);
        });
      });

      describe('equals', () => {
        it('should resolve when it equals', async () => {
          const result = await query.equals('Something').perform();
          expect(result).toBe(true);
        });

        it('should resolve when it doesn\'t equal', async () => {
          const result = await query.equals('something').perform();
          expect(result).toBe(false);
        });

        it('should resolve when it doesn\'t equal to null', async () => {
          const result = await query.equals(null).perform();
          expect(result).toBe(false);
        });
      });

      describe('notEmptyOrNull', () => {
        it('should resolve', async () => {
          const result = await query.notEmptyOrNull().perform();
          expect(result).toBe(true);
        });
      });

      describe('whenRejected', () => {
        it('should resolve', async () => {
          const result = await query.whenRejected('x').perform();
          expect(result).toBe('Something');
        });
      });
    });

    describe('given a string query that resolves to null', () => {
      let query: NullableStringQuery;
      beforeAll(async () => {
        query = baseQuery.findElement('#valid').getAttribute('non-existent');
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe(null);
      });

      describe('toNumber', () => {
        it('should reject', async () => {
          try {
            await query.toNumber().catch((err) => {
              expect(err).toBeDefined();
              return Promise.reject(err);
            });
            fail('Expected to throw');
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });

      describe('equals', () => {
        it('should resolve when it equals', async () => {
          const result = await query.equals(null).perform();
          expect(result).toBe(true);
        });

        it('should resolve when it doesn\'t equal', async () => {
          const result = await query.equals('something').perform();
          expect(result).toBe(false);
        });
      });

      describe('matches', () => {
        it('should resolve to false when regex is valid and doesn\'t match', async () => {
          const result = await query
            .matches(/(\w+\s)+div\s(\w+\s)*(\w+)/)
            .perform();
          expect(result).toBe(false);
        });
      });

      describe('notEmptyOrNull', () => {
        it('should resolve', async () => {
          const result = await query.notEmptyOrNull().perform();
          expect(result).toBe(false);
        });
      });

      describe('whenRejected', () => {
        it('should resolve', async () => {
          const result = await query.whenRejected('x').perform();
          expect(result).toBe(null);
        });
      });
    });

    describe('given a string query that rejects', () => {
      let query: NullableStringQuery;
      beforeAll(async () => {
        query = baseQuery
          .findElement('#non-existent')
          .getAttribute('non-existent');
      });

      it('should reject', async () => {
        try {
          await query.perform();
        } catch (err) {
          expect(err).toBeInstanceOf(NoSuchElementError);
        }
      });

      describe('notEmptyOrNull', () => {
        it('should reject', async () => {
          try {
            await query.notEmptyOrNull().perform();
          } catch (err) {
            expect(err).toBeInstanceOf(NoSuchElementError);
          }
        });
      });

      describe('whenRejected', () => {
        it('should resolve', async () => {
          const result = await query.whenRejected('x').perform();
          expect(result).toBe('x');
        });
      });
    });

    describe('given a string query that is empty', () => {
      let query: NullableStringQuery;
      beforeAll(async () => {
        query = baseQuery
          .findElement('#empty-attribute')
          .getAttribute('data-empty');
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe('');
      });

      describe('whenRejected', () => {
        it('should resolve', async () => {
          const result = await query.whenRejected('x').perform();
          expect(result).toBe('');
        });
      });

      describe('notEmptyOrNull', () => {
        it('should resolve', async () => {
          const result = await query.notEmptyOrNull().perform();
          expect(result).toBe(false);
        });
      });

      describe('whenRejectedOrFalsy', () => {
        it('should resolve', async () => {
          const result = await query.whenRejectedOrFalsy('x').perform();
          expect(result).toBe('x');
        });
      });
    });
  });
});
