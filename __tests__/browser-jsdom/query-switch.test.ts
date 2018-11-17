import {
  Query,
  StringQuery,
  ElementQuery,
  NumberQuery,
  AnyQuery
} from '../../src/browser/query';
import {
  OutOfOptionsError,
  NoSuchElementError,
  ArgumentError
} from '../../src/shared/errors';

describe('Query', () => {
  const query = new Query();

  document.body.innerHTML = `<div id="test">tested-value</div>
        <div id="container">
            <div id="option-1">Option 1</div>
            <div id="option-2">Option 2</div>
            <div id="option-3">Option 3</div>
            <div id="option-4">Option 4</div>
            <div id="option-5">Option 5</div>
        </div>`;

  describe('.switch() given string tested query', () => {
    const testedValueResolvesTo = 'tested-value';
    const testedQuery = (q: Query) => q.findElement('#test').getText();

    it(`that resolves to ${testedValueResolvesTo}`, async () => {
      const result = await testedQuery(query).perform();
      expect(result).toBe(testedValueResolvesTo);
    });

    describe('given matching value with string sub-queries', () => {
      const options = (q: Query) => ({
        [testedValueResolvesTo]: q.findElement('#option-1').getText(),
        'another-value': q.findElement('#option-2').getText()
      });

      it('should resolve', async () => {
        const switchQuery = query.switch(testedQuery, options);
        expect(switchQuery).toBeInstanceOf(StringQuery);
        const result = await switchQuery.perform();
        expect(result).toBe('Option 1');
      });
    });

    describe('given matching value with element sub-queries', () => {
      const options = (q: Query) => ({
        [testedValueResolvesTo]: q.findElement('#option-1'),
        'another-value': q.findElement('#option-2')
      });

      it('should resolve', async () => {
        const switchQuery = query.switch(testedQuery, options);
        expect(switchQuery.constructor.name).toBe(ElementQuery.name);
        const result = await switchQuery.perform();
        expect(result).toBeInstanceOf(HTMLElement);
        expect(result.innerHTML).toBe('Option 1');
      });
    });

    describe('given matching value with sub-queries of different type', () => {
      const options = (q: Query) => ({
        [testedValueResolvesTo]: q.findElement('#option-1'),
        'another-value': q.findElement('#option-2').getText()
      });

      it('should resolve', async () => {
        const switchQuery = query.switch(testedQuery, options);
        expect(switchQuery.constructor.name).toBe(AnyQuery.name);
        const result = await switchQuery.asElement().perform();
        expect(result).toBeInstanceOf(HTMLElement);
        expect(result.innerHTML).toBe('Option 1');
      });
    });

    describe('given matching value, with sub-query rejecting', () => {
      const options = (q: Query) => ({
        [testedValueResolvesTo]: q.findElement('#option-6').getText(),
        'another-value': q.findElement('#option-2').getText()
      });

      it('should reject', async () => {
        const result = query.switch(testedQuery, options).perform();

        await expect(result).rejects.toBeInstanceOf(NoSuchElementError);
      });
    });

    describe('given no matching value', () => {
      const options = (q: Query) => ({
        'another-value': q.findElement('#option-2').getText()
      });

      it('should reject', async () => {
        const result = query.switch(testedQuery, options).perform();

        await expect(result).rejects.toBeInstanceOf(OutOfOptionsError);
      });
    });

    describe('given zero matching values', () => {
      const options = (q: Query) => ({});

      it('should reject', async () => {
        const result = query.switch(testedQuery, options).perform();

        await expect(result).rejects.toBeInstanceOf(OutOfOptionsError);
      });
    });

    describe('given zero matching values, with default option', () => {
      const options = (q: Query) => ({});
      const defaultOption = (q: Query) => q.findElement('#option-1').getText();

      it('should reject', async () => {
        const result = await query
          .switch(testedQuery, options, defaultOption)
          .perform();

        expect(result).toBe('Option 1');
      });
    });

    describe('given no matching value with incorrect default option', () => {
      const options = (q: Query) => ({
        'another-value': q.findElement('#option-2').getText()
      });
      const defaultOption = (q: Query) => null;

      it('should reject', async () => {
        expect(() => query.switch(testedQuery, options, defaultOption)).toThrow(
          ArgumentError
        );
      });
    });

    describe('given no matching value with default option', () => {
      const options = (q: Query) => ({
        'another-value': q.findElement('#option-2').getText()
      });
      const defaultOption = (q: Query) => q.findElement('#option-1').getText();

      it('should resolve', async () => {
        const result = await query
          .switch(testedQuery, options, defaultOption)
          .perform();

        expect(result).toBe('Option 1');
      });
    });

    describe('given no matching value with default option of different type', () => {
      const options = (q: Query) => ({
        'another-value': q.findElement('#option-2').getText()
      });
      const defaultOption = (q: Query) => q.findElement('#option-1').exists();

      it('should resolve', async () => {
        const result = await query
          .switch(testedQuery, options, defaultOption)
          .perform();

        expect(result).toBe(true);
      });
    });
  });

  describe('.switch() given number tested query', () => {
    const testedValueResolvesTo = 5;
    const testedQuery = (q: Query) =>
      q.findElements('#container > div').count();

    it(`that resolves to ${testedValueResolvesTo}`, async () => {
      const result = await testedQuery(query).perform();
      expect(result).toBe(testedValueResolvesTo);
    });

    describe('given matching value with string sub-queries', () => {
      const options = (q: Query) => ({
        [testedValueResolvesTo]: q.findElement('#option-1').getText(),
        'another-value': q.findElement('#option-2').getText()
      });

      it('should resolve', async () => {
        const result = await query.switch(testedQuery, options).perform();
        expect(result).toBe('Option 1');
      });
    });
  });

  describe('.switch() given boolean as tested query', () => {
    describe('that resolves to false', () => {
      const testedValueResolvesTo = false;
      const testedQuery = (q: Query) => q.findElement('#non-existent').exists();

      it(`that resolves to ${testedValueResolvesTo}`, async () => {
        const result = await testedQuery(query).perform();
        expect(result).toBe(testedValueResolvesTo);
      });

      describe('given matching value with string sub-queries', () => {
        const args = {
          truthy: (q: Query) => q.findElement('#option-1').getText(),
          falsy: (q: Query) => q.findElement('#option-2').getText()
        };

        it('should resolve', async () => {
          const switchQuery = query.switch(
            testedQuery,
            args.truthy,
            args.falsy
          );
          expect(switchQuery.constructor.name).toBe(StringQuery.name);
          const result = await switchQuery.perform();
          expect(result).toBe('Option 2');
        });
      });
    });

    describe('that resolves to true', () => {
      const testedValueResolvesTo = true;
      const testedQuery = (q: Query) =>
        q
          .findElement('#non-existent')
          .exists()
          .not();

      it(`that resolves to ${testedValueResolvesTo}`, async () => {
        const result = await testedQuery(query).perform();
        expect(result).toBe(testedValueResolvesTo);
      });

      describe('given matching value with string sub-queries', () => {
        const args = {
          truthy: (q: Query) => q.findElement('#option-1').getText(),
          falsy: (q: Query) => q.findElement('#option-2').getText()
        };

        it('should resolve', async () => {
          const switchQuery = query.switch(
            testedQuery,
            args.truthy,
            args.falsy
          );
          expect(switchQuery.constructor.name).toBe(StringQuery.name);
          const result = await switchQuery.perform();
          expect(result).toBe('Option 1');
        });
      });

      describe('given matching value with sub-queries of different type', () => {
        const args = {
          truthy: (q: Query) => q.findElement('#option-2').getText(),
          falsy: (q: Query) => q.findElement('#option-1')
        };

        it('should resolve', async () => {
          const switchQuery = query.switch(
            testedQuery,
            args.truthy,
            args.falsy
          );
          expect(switchQuery.constructor.name).toBe(AnyQuery.name);
          const result = await switchQuery.perform();
          expect(result).toBe('Option 2');
        });
      });
    });
  });

  describe('.switch() given element as tested query', () => {
    const testedQuery = (q: Query) => q.findElement('some-element');
    const args = (q: Query) => ({});

    it('should throw', async () => {
      // @ts-ignore
      expect(() => query.switch(testedQuery, args)).toThrow(ArgumentError);
    });
  });

  describe('.switch() given undefined as tested query', () => {
    const testedQuery = undefined;
    const args = (q: Query) => ({});

    it('should throw', async () => {
      // @ts-ignore
      expect(() => query.switch(testedQuery, args)).toThrow(ArgumentError);
    });
  });

  describe('.switch() given null as tested query', () => {
    const testedQuery = null;
    const args = (q: Query) => ({});

    it('should throw', async () => {
      // @ts-ignore
      expect(() => query.switch(testedQuery, args)).toThrow(ArgumentError);
    });
  });

  describe('.switch() given null instead of tested query', () => {
    const testedQuery = (q: Query) => null;
    const args = (q: Query) => ({});

    it('should throw', async () => {
      // @ts-ignore
      expect(() => query.switch(testedQuery, args)).toThrow(ArgumentError);
    });
  });

  describe('.switch() given {} instead of tested query', () => {
    const testedQuery = (q: Query) => ({});
    const args = (q: Query) => ({});

    it('should throw', async () => {
      // @ts-ignore
      expect(() => query.switch(testedQuery, args)).toThrow(ArgumentError);
    });
  });

  describe('.switch() given valid condition query', () => {
    const testedQuery = (q: Query) => q.execute(() => true).asBoolean();

    describe('given invalid truthy query', () => {
      const arg1 = (q: Query) => undefined;
      const arg2 = (q: Query) => q.execute(arg => arg, '').asString();

      it('should throw', async () => {
        // @ts-ignore
        expect(() => query.switch(testedQuery, arg1, arg2)).toThrow(
          ArgumentError
        );
      });
    });

    describe('given invalid truthy query', () => {
      const arg1 = (q: Query) => q.execute(arg => arg, '').asString();
      const arg2 = (q: Query) => undefined;

      it('should throw', async () => {
        // @ts-ignore
        expect(() => query.switch(testedQuery, arg1, arg2)).toThrow(
          ArgumentError
        );
      });
    });

    describe('given no falsy query', () => {
      const arg1 = (q: Query) => q.execute(arg => arg, '').asString();
      const arg2 = undefined;

      it('should throw', async () => {
        // @ts-ignore
        expect(() => query.switch(testedQuery, arg1, arg2)).toThrow(
          ArgumentError
        );
      });
    });
  });

  describe('.switch() given valid string query', () => {
    const testedQuery = (q: Query) => q.execute(() => 'ABC').asString();

    describe('given invalid options query', () => {
      const opts = (q: Query) => undefined;

      it('should throw', async () => {
        // @ts-ignore
        expect(() => query.switch(testedQuery, opts)).toThrow(ArgumentError);
      });
    });

    describe('given invalid options query', () => {
      const opts = {};

      it('should throw', async () => {
        // @ts-ignore
        expect(() => query.switch(testedQuery, opts)).toThrow(ArgumentError);
      });
    });

    describe('given invalid options query', () => {
      const opts = (q: Query) => ({
        ABC: 'XYZ'
      });

      it('should throw', async () => {
        // @ts-ignore
        expect(() => query.switch(testedQuery, opts)).toThrow(ArgumentError);
      });
    });
  });

  describe('.switch() given any query as condition', () => {
    const testedQuery = (q: Query) => q.execute(() => 'ABC');

    describe('given valid truthy and falsy options', () => {
      const truthy = (q: Query) => q.execute(() => 'DEF');
      const falsy = (q: Query) => q.execute(() => 'XYZ');

      it('should resolve', async () => {
        const result = await query.switch(testedQuery, truthy, falsy).perform();
        expect(result).toBe('DEF');
      });
    });
  });
});
