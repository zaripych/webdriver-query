import 'css.escape';
import { describeBrowserTests } from '../utils/browser-tests-config';
import { Query, StringQuery } from '../../src/node/query';
import { NoSuchElementError, ArgumentError } from '../../src/shared/errors';

describe('StringQuery', () => {
  describeBrowserTests((testDataBuilder) => {
    let baseQuery: Query;
    beforeAll(async () => {
      const result = await testDataBuilder();
      baseQuery = result.query;
    });

    describe('given a string query that resolves to a number string', () => {
      let query: StringQuery;
      beforeAll(async () => {
        query = baseQuery.findElement('#idNum').getText();
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe('456.32');
      });

      describe('toNumber', () => {
        it('should resolve to a float', async () => {
          const num = await query.toNumber();
          expect(num).toBe(456.32);
        });

        it('should resolve to a number', async () => {
          const num = await query.toNumber({ float: false });
          expect(num).toBe(456);
        });
      });
    });

    describe('given a string query that resolves', () => {
      let query: StringQuery;
      beforeAll(async () => {
        query = baseQuery.findElement('#id_01').getText();
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe('A div with id_01');
      });

      describe('toNumber for a non-number text', () => {
        it('should reject', async () => {
          try {
            await query.toNumber();
            fail('Expected to throw!');
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });

      describe('matches', () => {
        it('should resolve to true when regex is valid and matches', async () => {
          const result = await query
            .matches(/(\w+\s)+div\s(\w+\s)*(\w+)/)
            .perform();
          expect(result).toBe(true);
        });

        it('should resolve to false when regex is valid and doesn\'t match', async () => {
          const result = await query
            .matches(/(\w+\s)+span\s(\w+\s)*(\w+)/)
            .perform();
          expect(result).toBe(false);
        });

        // NOTE: RegExp cannot be invalid, we will get JS parse errors
      });

      describe('notEmpty', () => {
        it('should resolve', async () => {
          const result = await query.notEmpty().perform();
          expect(result).toBe(true);
        });
      });

      describe('whenRejected', () => {
        it('should resolve', async () => {
          const result = await query.whenRejected('x').perform();
          expect(result).toBe('A div with id_01');
        });
      });
    });

    describe('given a string query that rejects', () => {
      let query: StringQuery;
      beforeAll(async () => {
        query = baseQuery.findElement('#non-existent').getText();
      });

      it('should reject', async () => {
        try {
          await query.perform();
        } catch (err) {
          expect(err).toBeInstanceOf(NoSuchElementError);
        }
      });

      describe('notEmpty', () => {
        it('should reject', async () => {
          try {
            await query.notEmpty().perform();
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
      let query: StringQuery;
      beforeAll(async () => {
        query = baseQuery.findElement('#valid').getText();
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

      describe('whenRejectedOrFalsy', () => {
        it('should resolve', async () => {
          const result = await query.whenRejectedOrFalsy('x').perform();
          expect(result).toBe('x');
        });
      });
    });
  });
});
