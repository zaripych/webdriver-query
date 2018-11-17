import { Query } from '../../src/browser/query';
import { UnexpectedTypeError } from '../../src/shared/errors';

describe('Query.execute', () => {
  let query: Query;
  beforeAll(() => {
    query = new Query();
  });

  it('works when asString for a string using string script', async () => {
    const result = query
      .execute(`return 'Some string'`)
      .asString()
      .perform();
    await expect(result).resolves.toBe('Some string');
  });

  it('works when asString for a string', async () => {
    const result = query
      .execute(() => 'Some string')
      .asString()
      .perform();
    await expect(result).resolves.toBe('Some string');
  });

  it('fails when asObject for a string', async () => {
    await expect(
      query
        .execute(() => 'Some string')
        .asObject()
        .perform()
    ).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('fails when asElement for a string', async () => {
    const result = query
      .execute(() => 'Some string')
      .asObject()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('works when asObject for an object', async () => {
    const result = query
      .execute(() => ({ value: 'Some other string' }))
      .asObject()
      .perform();
    await expect(result).resolves.toMatchObject({ value: 'Some other string' });
  });

  it('fails when asString for an object', async () => {
    const result = query
      .execute(() => ({ value: 'Some other string' }))
      .asString()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('fails when asElement for an object', async () => {
    const result = query
      .execute(() => ({ value: 'Some other string' }))
      .asElement()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('works when asElement for an element', async () => {
    const element = document.createElement('div');
    const result = query
      .execute(() => element)
      .asElement()
      .perform();
    await expect(result).resolves.toBe(element);
  });

  it('fails when asObject for an element', async () => {
    const element = document.createElement('div');
    const result = query
      .execute(() => element)
      .asObject()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('fails when asString for an element', async () => {
    const element = document.createElement('div');
    const result = query
      .execute(() => element)
      .asString()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('fails when asElement for undefined', async () => {
    const result = query
      .execute(() => undefined)
      .asElement()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('fails when asObject for undefined', async () => {
    const result = query
      .execute(() => undefined)
      .asObject()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('fails when asString for undefined', async () => {
    const result = query
      .execute(() => undefined)
      .asString()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });

  it('fails when asBoolean for undefined', async () => {
    const result = query
      .execute(() => undefined)
      .asBoolean()
      .perform();
    await expect(result).rejects.toBeInstanceOf(UnexpectedTypeError);
  });
});
