import { describeBrowserTests } from '../utils/browser-tests-config';
import { Query, ConditionQuery } from '../../src/node/query';
import { NoSuchElementError } from '../../src/shared/errors';

describe('ConditionQuery', () => {
  describeBrowserTests((testDataBuilder) => {
    let baseQuery: Query;
    beforeAll(async () => {
      const result = await testDataBuilder();
      baseQuery = result.query;
    });

    describe('given condition query that resolves to true', () => {
      let query: ConditionQuery;
      beforeAll(async () => {
        query = baseQuery.findElement('#id_01').exists();
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe(true);
      });

      describe('when negated', () => {
        let negated: ConditionQuery;
        beforeAll(async () => {
          negated = query.not();
        });

        it('should resolve', async () => {
          const result = await negated.perform();
          expect(result).toBe(false);
        });
      });
    });

    describe('given condition query that resolves to false', () => {
      let query: ConditionQuery;
      beforeAll(async () => {
        query = baseQuery
          .findElement('#id_01')
          .getText()
          .equals('A div with id_02');
      });

      it('should resolve', async () => {
        const result = await query.perform();
        expect(result).toBe(false);
      });

      describe('when negated', () => {
        let negated: ConditionQuery;
        beforeAll(async () => {
          negated = query.not();
        });

        it('should resolve', async () => {
          const result = await negated.perform();
          expect(result).toBe(true);
        });

        describe('with a rejected substitution value', () => {
          let handled: ConditionQuery;
          beforeAll(async () => {
            handled = negated.whenRejected(false);
          });

          it('should resolve', async () => {
            const result = await handled.perform();
            expect(result).toBe(true);
          });
        });
      });

      describe('with a rejected substitution value', () => {
        let handled: ConditionQuery;
        beforeAll(async () => {
          handled = query.whenRejected(true);
        });

        it('should resolve', async () => {
          const result = await handled.perform();
          expect(result).toBe(false);
        });
      });
    });

    describe('given condition query that rejects', () => {
      let query: ConditionQuery;
      beforeAll(async () => {
        query = baseQuery
          .findElement('#id_xx')
          .getText()
          .equals('A div with id_02');
      });

      it('should reject', async () => {
        try {
          await query.perform();
          throw new Error('The above block is expected to throw');
        } catch (err) {
          expect(err).toBeInstanceOf(NoSuchElementError);
        }
      });

      describe('when negated', () => {
        let negated: ConditionQuery;
        beforeAll(async () => {
          negated = query.not();
        });

        it('should reject', async () => {
          try {
            await negated.perform();
            throw new Error('The above block is expected to throw');
          } catch (err) {
            expect(err).toBeInstanceOf(NoSuchElementError);
          }
        });
      });

      describe('with a rejected substitution value', () => {
        let handled: ConditionQuery;
        beforeAll(async () => {
          handled = query.whenRejected(false);
        });

        it('should resolve', async () => {
          const result = await handled.perform();
          expect(result).toBe(false);
        });
      });
    });
  });
});
