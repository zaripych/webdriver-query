import 'css.escape';
import * as selenium from 'selenium-webdriver';
import { describeBrowserTests } from '../utils/browser-tests-config';
import { UnexpectedTypeError } from '../../src/shared/errors';
import { Query } from '../../src/node/query';

describe('OptionalQuery', () => {
  describeBrowserTests((testDataBuilder) => {
    let query: Query;
    beforeAll(async () => {
      const result = await testDataBuilder();
      query = result.query;
    });

    it('works when truthy for truthy', async () => {
      await expect(
        query
          .execute(`return true`)
          .truthy()
          .perform()
      ).resolves.toBe(true);
    });

    it('works when asBoolean for a boolean', async () => {
      await expect(
        query
          .execute(`return true`)
          .asBoolean()
          .perform()
      ).resolves.toBe(true);
    });

    it('works when asString for a string', async () => {
      await expect(
        query
          .execute(`return 'Some string'`)
          .asString()
          .perform()
      ).resolves.toBe('Some string');
    });

    it('fails when asObject for a string', async () => {
      await expect(
        query
          .execute(`return 'Some string'`)
          .asObject()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('fails when asElement for a string', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => 'Some string'
          )
          .asObject()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('works when asObject for an object', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => ({ value: 'Some other string' })
          )
          .asObject()
          .perform()
      ).resolves.toMatchObject({ value: 'Some other string' });
    });

    it('fails when asString for an object', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => ({ value: 'Some other string' })
          )
          .asString()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('fails when asElement for an object', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => ({ value: 'Some other string' })
          )
          .asElement()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('works when asElement for an element', async () => {
      const result = await query
        .execute('return document.documentElement')
        .asElement()
        .perform();
      await expect(result).toBeInstanceOf(selenium.WebElement);
    });

    it('fails when asObject for an element', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => document.documentElement
          )
          .asObject()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('fails when asString for an element', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => document.documentElement
          )
          .asString()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('fails when asElement for undefined', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => undefined
          )
          .asElement()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('fails when asObject for undefined', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => undefined
          )
          .asObject()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });

    it('fails when asString for undefined', async () => {
      await expect(
        query
          .execute(
            /* istanbul ignore next */
            () => undefined
          )
          .asString()
          .perform()
      ).rejects.toBeInstanceOf(UnexpectedTypeError);
    });
  });
});
