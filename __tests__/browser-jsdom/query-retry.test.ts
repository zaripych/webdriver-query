import { Query } from '../../src/browser/query';
import { TimeoutError, NoSuchElementError } from '../../src/shared/errors';

describe('Query', () => {
  it('.retry() waits until resolved', async () => {
    document.body.innerHTML = `<div id="parent">
    <div id="spinner">Loading...</div>
</div>`;
    const query = new Query({
      waitTimeoutMilliseconds: 5000,
      pollTimes: 5000,
      minPollPeriodMilliseconds: 1
    });

    await expect(
      query
        .findElement('#data')
        .getText()
        .perform()
    ).rejects.toBeInstanceOf(NoSuchElementError);

    setTimeout(() => {
      const element = document.createElement('div') as HTMLElement;
      element.setAttribute('id', 'data');
      element.innerHTML = 'Data Loaded...';
      const parent = document.getElementById('parent') as HTMLElement;
      parent.appendChild(element);
      const spinner = document.getElementById('spinner') as HTMLElement;
      spinner.remove();
    }, 100);

    await expect(
      query
        .findElement('#data')
        .retry()
        .getText()
        .perform()
    ).resolves.toBe('Data Loaded...');

    await expect(
      query.findElement('#spinner').perform()
    ).rejects.toBeInstanceOf(NoSuchElementError);
  });

  it('.waitUntil() waits until resolved', async () => {
    document.body.innerHTML = `<div id="parent">
    <div id="spinner">Loading...</div>
</div>`;
    const query = new Query({
      waitTimeoutMilliseconds: 5000,
      pollTimes: 5000,
      minPollPeriodMilliseconds: 1
    });

    await expect(
      query
        .findElement('#data')
        .getText()
        .perform()
    ).rejects.toBeInstanceOf(NoSuchElementError);

    setTimeout(() => {
      const element = document.createElement('div') as HTMLElement;
      element.setAttribute('id', 'data');
      element.innerHTML = 'Data Loaded...';
      const parent = document.getElementById('parent') as HTMLElement;
      parent.appendChild(element);
      const spinner = document.getElementById('spinner') as HTMLElement;
      spinner.remove();
    }, 100);

    await expect(
      query
        .findElement('#data')
        .waitUntil((q) => q.exists(), { timeout: 5000 })
        .getText()
        .perform()
    ).resolves.toBe('Data Loaded...');

    await expect(
      query.findElement('#spinner').perform()
    ).rejects.toBeInstanceOf(NoSuchElementError);
  });

  it('.retry(timeout) waits until resolved', async () => {
    document.body.innerHTML = `<div id="parent">
    <div id="spinner">Loading...</div>
</div>`;
    const query = new Query();

    await expect(
      query
        .findElement('#data')
        .getText()
        .perform()
    ).rejects.toBeInstanceOf(NoSuchElementError);

    setTimeout(() => {
      const element = document.createElement('div') as HTMLElement;
      element.setAttribute('id', 'data');
      element.innerHTML = 'Data Loaded...';
      const parent = document.getElementById('parent') as HTMLElement;
      parent.appendChild(element);
      const spinner = document.getElementById('spinner') as HTMLElement;
      spinner.remove();
    }, 1000);

    await expect(
      query
        .findElement('#data')
        .retry({ timeout: 500, pollPeriod: 100 })
        .getText()
        .perform()
    ).rejects.toBeInstanceOf(TimeoutError);
  });
});
