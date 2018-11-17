import 'css.escape';
import { describeBrowserTests } from '../utils/browser-tests-config';
import { Query, NumberQuery } from '../../src/node/query';
import { ArgumentError } from '../../src/shared/errors';

describe('NumberQuery', () => {
  describeBrowserTests((testDataBuilder) => {
    let baseQuery: Query;
    beforeAll(async () => {
      const result = await testDataBuilder();
      baseQuery = result.query;
    });

    describe('given rejecting parent query', () => {
      let query: NumberQuery;
      beforeAll(() => {
        query = baseQuery.findElements('#%$&%^*(&)').count();
      });

      describe('equals', () => {
        it('should reject', async () => {
          try {
            await query.equals(0).perform();
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });

      describe('greaterThan', () => {
        it('should reject', async () => {
          try {
            await query.greaterThan(0).perform();
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });

      describe('.lessThan(any)', () => {
        it('should reject', async () => {
          try {
            await query.lessThan(0).perform();
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });

      describe('.greaterThanOrEqual(any)', () => {
        it('should reject', async () => {
          try {
            await query.greaterThanOrEqual(0).perform();
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });

      describe('.lessThanOrEqual(any)', () => {
        it('should reject', async () => {
          try {
            await query.lessThanOrEqual(0).perform();
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });

      describe('.whenRejected(value)', () => {
        it('should reject', async () => {
          try {
            await query.whenRejected(0).perform();
          } catch (err) {
            expect(err).toBeInstanceOf(ArgumentError);
          }
        });
      });
    });

    describe('given number 2 as resolved value', () => {
      let query: NumberQuery;
      beforeAll(() => {
        query = baseQuery.findElements('#with-children .child').count();
      });

      describe('equals(2)', () => {
        it('should resolve', async () => {
          const result = await query.equals(2).perform();
          expect(result).toBe(true);
        });
      });

      describe('greaterThan(1)', () => {
        it('should resolve', async () => {
          const result = await query.greaterThan(1).perform();
          expect(result).toBe(true);
        });
      });

      describe('greaterThan(2)', () => {
        it('should resolve', async () => {
          const result = await query.greaterThan(2).perform();
          expect(result).toBe(false);
        });
      });

      describe('lessThan(3)', () => {
        it('should resolve', async () => {
          const result = await query.lessThan(3).perform();
          expect(result).toBe(true);
        });
      });

      describe('lessThan(2)', () => {
        it('should resolve', async () => {
          const result = await query.lessThan(2).perform();
          expect(result).toBe(false);
        });
      });

      describe('.greaterThanOrEqual(2)', () => {
        it('should resolve', async () => {
          const result = await query.greaterThanOrEqual(2).perform();
          expect(result).toBe(true);
        });
      });

      describe('.lessThanOrEqual(2)', () => {
        it('should resolve', async () => {
          const result = await query.lessThanOrEqual(2).perform();
          expect(result).toBe(true);
        });
      });

      describe('.whenRejected(42)', () => {
        it('should resolve', async () => {
          const result = await query.whenRejected(42).perform();
          expect(result).toBe(2);
        });
      });

      describe('.execute(v => v + 1)', () => {
        it('should resolve', async () => {
          const result = await query.execute((v) => v + 1).perform();
          expect(result).toBe(3);
        });
      });
    });
  });
});
