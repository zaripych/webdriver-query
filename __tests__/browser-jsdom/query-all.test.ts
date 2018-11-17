import { Query } from '../../src/browser/query';
import { NoSuchElementError } from '../../src/shared/errors';

describe('Query', () => {
  it('.all(...) resolves', async () => {
    document.body.innerHTML = `<div id="parent">
    <div id="first-name">First Name</div>
    <div id="last-name">Last Name</div>
    <div class="details">
        <span class="dob">17.03.86</span>
    </div>
</div>`;
    const base = new Query();
    await expect(base.findElement('#parent').perform()).resolves.toBe(
      document.getElementById('parent')
    );

    const testedResult = base
      .batch({
        parent: base.findElement('#parent'),
        firstName: base.findElement('#first-name').getText(),
        lastName: base.findElement('#last-name').getText(),
        dob: base.findElement('.details > .dob').getText()
      })
      .perform();

    await expect(testedResult).resolves.toMatchObject({
      parent: document.getElementById('parent'),
      firstName: 'First Name',
      lastName: 'Last Name',
      dob: '17.03.86'
    });
  });

  it('.all() rejects if any of sub-query reject', async () => {
    document.body.innerHTML = `<div id="parent">
    <div id="first-name">First Name</div>
    <div id="last-name">Last Name</div>
    <div class="details">
        <span class="dob">17.03.86</span>
    </div>
</div>`;
    const base = new Query();
    await expect(base.findElement('#parent').perform()).resolves.toBe(
      document.getElementById('parent')
    );

    const testedResult = base
      .batch({
        parent: base.findElement('#parent'),
        firstName: base.findElement('#first-name').getText(),
        lastName: base.findElement('#last-name').getText(),
        dob: base.findElement('.details > .dob').getText(),
        hometown: base.findElement('.hometown').getText()
      })
      .perform();

    await expect(testedResult).rejects.toBeInstanceOf(NoSuchElementError);
  });
});
