import * as Errors from '../../src/shared/errors';
import { waitFor } from '../../src/browser/query/wait';

jest.mock('../../src/browser/dom-library');

describe('waitFor', () => {
  it('waitFor(true) resolves', async () => {
    const result = await waitFor({
      condition: () => Promise.resolve(true),
      timeout: 1000,
      pollPeriod: 100
    });
    expect(result).toEqual(true);
  });

  it('waitFor(false) times out', async () => {
    await expect(
      waitFor({
        condition: () => Promise.resolve(false),
        timeout: 5,
        pollPeriod: 1
      })
    ).rejects.toBeInstanceOf(Errors.TimeoutError);
  });

  it('waitFor(reject...) times out', async () => {
    await expect(
      waitFor({
        condition: () => Promise.reject(new Error('Test error')),
        timeout: 5,
        pollPeriod: 1
      })
    ).rejects.toBeInstanceOf(Errors.TimeoutError);
  });

  it('waitFor(throw...) times out with default { shouldIgnore: (err) => true }', async () => {
    await expect(
      waitFor({
        condition: () => {
          throw new Error('Test error');
        },
        timeout: 5,
        pollPeriod: 1
      })
    ).rejects.toBeInstanceOf(Errors.TimeoutError);
  });

  it('waitFor(throw...) with custom { shouldIgnore: (err) => true } should ignore', async () => {
    const shouldIgnore = jest.fn(() => {
      return true;
    });

    let thrown = false;
    const result = await waitFor({
      shouldIgnoreError: shouldIgnore,
      condition: () => {
        if (!thrown) {
          thrown = true;
          throw new Error('Test error');
        }
        return Promise.resolve(444);
      },
      timeout: 5,
      pollPeriod: 1
    });

    expect(result).toBe(444);
    expect(shouldIgnore).toHaveBeenCalledTimes(1);
  });

  it('waitFor(throw...) with { shouldIgnore: (err) => false } should reject', async () => {
    const shouldIgnore = jest.fn(() => {
      return false;
    });

    await expect(
      waitFor({
        shouldIgnoreError: shouldIgnore,
        condition: () => {
          throw new Error('Test error');
        },
        timeout: 5,
        pollPeriod: 1
      })
    ).rejects.toThrow('Test error');
  });

  it('waitFor(++n >= 10) returns 10', () => {
    let n = 0;
    return expect(
      waitFor({
        condition: () => Promise.resolve(++n >= 10),
        timeout: 1000,
        pollPeriod: 1
      })
    )
      .resolves.toBe(true)
      .then(() => {
        expect(n).toBe(10);
      });
  });
});
