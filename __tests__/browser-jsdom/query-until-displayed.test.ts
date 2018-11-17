import { Query } from '../../src/browser/query';

describe('Query', () => {
  it('.waitUntil() waits until resolved', async () => {
    document.body.innerHTML = `<div id="parent">
    <div id="spinner">Loading...</div>
    <div id="data" style="display: none;" data-is-displayed="false">Data Loaded...</div>
</div>`;
    const query = new Query({
      waitTimeoutMilliseconds: 5000,
      pollTimes: 5000,
      minPollPeriodMilliseconds: 1
    });

    await expect(
      query
        .findElement('#data')
        .batch(q => ({
          text: q.getText(),
          isDisplayed: q.isDisplayed()
        }))
        .perform()
    ).resolves.toMatchObject({
      text: '',
      isDisplayed: false
    });

    setTimeout(() => {
      const data = document.getElementById('data') as HTMLElement;
      data.style.display = 'block';
      data.setAttribute('data-is-displayed', 'true');
    }, 100);

    await expect(
      query
        .findElement('#data')
        .waitUntil(q => q.getAttribute('data-is-displayed').equals('true'))
        .getText()
        .perform()
    ).resolves.toBe('Data Loaded...');
  });
});
