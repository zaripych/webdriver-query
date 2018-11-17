import { Query } from '../../src/browser/query';

describe('Query', () => {
  it('.sequence(...) resolves', () => {
    document.body.innerHTML = `<div id="parent">
    <div id="first" onclick="event.target.innerHTML += 'x';" >y</div>
    <div id="second" onclick="event.target.innerHTML += ('x' + document.getElementById('first').innerHTML);" >y</div>
    <div id="third" onclick="event.target.innerHTML += ('x' + document.getElementById('second').innerHTML);" >y</div>
</div>`;
    const base = new Query();
    return expect(
      base
        .sequence(q => [
          q.findElement('#first').imitateClick(),
          q.findElement('#second').imitateClick(),
          q.findElement('#third').imitateClick()
        ])
        .batch({
          first: base.findElement('#first').getText(),
          second: base.findElement('#second').getText(),
          third: base.findElement('#third').getText()
        })
        .perform()
    ).resolves.toMatchObject({
      first: 'yx',
      second: 'yxyx',
      third: 'yxyxyx'
    });
  });
});
