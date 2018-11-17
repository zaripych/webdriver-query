import { Query } from '../../src/browser/query';
import { ArgumentError, NoSuchElementError } from '../../src/shared/errors';
import { escapeRegExp } from '../utils/escape-regexp';
import { DomLibrary } from '../../src/browser/dom-library';
import { QueryBuilder } from '../../src/shared/query';

describe('Query', () => {
  let query: Query;
  beforeAll(() => {
    query = new Query();
  });

  it(
    'when complex query performed with invalid query parameters it rejects ' +
      'with description of the failed sub-query',
    () => {
      document.body.innerHTML = `<div id="outer"><div id="inner"></div></div>`;

      const outerSelector = '#outer';
      const invalidSelector = ')(&*^&*^#$!';
      const innerSelector = '#inner';
      const regexp = new RegExp(
        '.*a\\ssub-query:\\s*' +
          escapeRegExp(`findElement("#outer").findElement(")(&*^&*^#$!")`) +
          '.*',
        'm'
      );
      return expect(
        query
          .findElement(outerSelector)
          .findElement(invalidSelector)
          .findElement(innerSelector)
          .findElement(innerSelector)
          .perform()
          .catch((err: ArgumentError) => {
            expect(err.message).toMatch(regexp);
            return Promise.reject(err);
          })
      ).rejects.toBeInstanceOf(ArgumentError);
    }
  );

  it('when findElement performed with invalid query parameters it rejects', () => {
    const invalidSelector = ')(&*^&*^#$!';
    return expect(
      query.findElement(invalidSelector).perform()
    ).rejects.toBeInstanceOf(ArgumentError);
  });

  it('findElement works with a valid selector', () => {
    document.body.innerHTML = `<div id="valid"></div>`;
    const outerSelector = '#valid';
    return expect(
      query.findElement(outerSelector).perform()
    ).resolves.toBeInstanceOf(HTMLElement);
  });

  it('findElement fails when no elements selector', () => {
    document.body.innerHTML = `<div id="valid"></div>`;
    const invalidSelector = '#invalid';
    const regexp = new RegExp(
      '.*' +
        escapeRegExp(`Selector '${invalidSelector}' returned no elements`) +
        '.*'
    );
    return expect(
      query
        .findElement(invalidSelector)
        .perform()
        .catch((err: NoSuchElementError) => {
          expect(err.toString()).toMatch(regexp);
          return Promise.reject(err);
        })
    ).rejects.toBeInstanceOf(NoSuchElementError);
  });

  it('findElement returns first when multiple elements match', () => {
    document.body.innerHTML = `<div class="target"></div><div class="target"></div>`;
    const outerSelector = '.target';
    return expect(
      query.findElement(outerSelector).perform()
    ).resolves.toBeInstanceOf(HTMLElement);
  });

  it('findElements works with a valid selector', () => {
    document.body.innerHTML = `<div class="target"></div><div class="target"></div>`;
    const outerSelector = '.target';
    return expect(
      query
        .findElements(outerSelector)
        .perform()
        .then(elements => {
          expect(elements).toBeInstanceOf(Array);
          expect(elements.length).toBe(2);
          if (elements && elements instanceof Array) {
            elements.map(element => {
              expect(element).toBeInstanceOf(HTMLElement);
            });
          }
          return Promise.resolve(elements);
        })
    ).resolves.toBeInstanceOf(Array);
  });

  it('findElements works with a single element', () => {
    document.body.innerHTML = `<div class="target"></div>`;
    const outerSelector = '.target';
    return expect(
      query
        .findElements(outerSelector)
        .perform()
        .then(elements => {
          expect(elements).toBeInstanceOf(Array);
          expect(elements.length).toBe(1);
          if (elements && elements instanceof Array) {
            elements.map(element => {
              expect(element).toBeInstanceOf(HTMLElement);
            });
          }
          return Promise.resolve(elements);
        })
    ).resolves.toBeInstanceOf(Array);
  });

  describe('exists', () => {
    it('works with a valid selector', () => {
      document.body.innerHTML = `<div id="valid"></div>`;
      const outerSelector = '#valid';
      return expect(
        query
          .findElement(outerSelector)
          .exists()
          .perform()
      ).resolves.toBe(true);
    });

    it('when performed with invalid query parameters it rejects, similar to WebDriver', () => {
      document.body.innerHTML = `<div id="valid"></div>`;
      const invalidSelector = ')(&*^&*^#$!';
      return expect(
        query
          .findElement(invalidSelector)
          .exists()
          .perform()
      ).rejects.toBeInstanceOf(ArgumentError);
    });

    it('when selector identifies no elements, it returns false', () => {
      document.body.innerHTML = `<div id="valid"></div>`;
      const invalidSelector = '#invalid';
      return expect(
        query
          .findElement(invalidSelector)
          .exists()
          .perform()
      ).resolves.toBe(false);
    });

    it('returns true when multiple elements match', () => {
      document.body.innerHTML = `<div class="target"></div><div class="target"></div>`;
      const outerSelector = '.target';
      return expect(
        query
          .findElement(outerSelector)
          .exists()
          .perform()
      ).resolves.toBe(true);
    });
  });

  it('getAttribute works for existing attribute', () => {
    document.body.innerHTML = `<div id="id" data-something="attribute-value"></div>`;
    const attributeName = 'data-something';
    const attributeValue = 'attribute-value';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getAttribute(attributeName)
        .perform()
    ).resolves.toBe(attributeValue);
  });

  it('getAttribute returns empty for non-existing attribute', () => {
    document.body.innerHTML = `<div id="id" data-something="attribute-value"></div>`;
    const anotherAttributeName = 'data-another';
    const expectedValue = null;
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getAttribute(anotherAttributeName)
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('getAttribute returns empty for invalid attribute name', () => {
    document.body.innerHTML = `<div id="id" data-something="attribute-value"></div>`;
    const invalidAttributeName = 'ab%^#%&*&(**)((_r';
    const expectedValue = null;
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getAttribute(invalidAttributeName)
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('getText works for multi-line element', () => {
    document.body.innerHTML = `    <div id="multiline-text">Hello</br>
    There<strong>
        This is a test
    </strong></div>`;
    const expectedValue = `Hello
    There
        This is a test
    `;
    const selector = '#multiline-text';
    return expect(
      query
        .findElement(selector)
        .getText()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('getText works for empty element', () => {
    document.body.innerHTML = `<div id="id"></div>`;
    const expectedValue = '';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getText()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('getText works for non-empty element', () => {
    document.body.innerHTML = `<div id="id">Non empty element</div>`;
    const expectedValue = 'Non empty element';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getText()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('getCssValue works for element with no style', () => {
    document.body.innerHTML = `<div id="id"></div>`;
    const expectedValue = '0px';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getCssValue('width')
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('getCssValue works for element with style', () => {
    document.body.innerHTML = `<div id="id" style="width: 5px;"></div>`;
    const expectedValue = '5px';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getCssValue('width')
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('getLocation works', () => {
    document.body.innerHTML = `<div id="id"></div>`;
    const expectedValue = {
      x: 0,
      y: 0
    };
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getLocation()
        .perform()
    ).resolves.toMatchObject(expectedValue);
  });

  it('getSize works', () => {
    document.body.innerHTML = `<div id="id"></div>`;
    const expectedValue = {
      width: 0,
      height: 0
    };
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getSize()
        .perform()
    ).resolves.toMatchObject(expectedValue);
  });

  it('getTagName works', () => {
    document.body.innerHTML = `<div id="id"></div>`;
    const expectedValue = 'div';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .getTagName()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('isEnabled works when element is enabled', () => {
    document.body.innerHTML = `<button id="id"></button>`;
    const expectedValue = true;
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .isEnabled()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('isEnabled works when element is disabled', () => {
    document.body.innerHTML = `<button id="id" disabled="disabled"></button>`;
    const expectedValue = false;
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .isEnabled()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('isSelected works when element is not selected', () => {
    document.body.innerHTML = `<option id="id"></option>`;
    const expectedValue = false;
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .isSelected()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('isSelected works when element is selected', () => {
    document.body.innerHTML = `<option id="id" selected="selected"></option>`;
    const expectedValue = true;
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .isSelected()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('innerHTML works', () => {
    document.body.innerHTML = `<div id="id"><p>Hello world!</p></div>`;
    const expectedValue = '<p>Hello world!</p>';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .innerHTML()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('className works', () => {
    document.body.innerHTML = `<div id="id" class="some-long-class another-class"><p>Hello world!</p></div>`;
    const expectedValue = 'some-long-class another-class';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .class()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('className works when empty', () => {
    document.body.innerHTML = `<div id="id"><p>Hello world!</p></div>`;
    const expectedValue = '';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .class()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('execute works', () => {
    document.body.innerHTML = `<div id="id"><p>INNER</p></div>`;
    const expectedValue = '<p>INNER</p>';
    const selector = '#id';
    return expect(
      query
        .findElement(selector)
        .execute(element => element.innerHTML)
        .asString()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('imitateClick works', () => {
    // tslint:disable-next-line:max-line-length
    document.body.innerHTML = `<button id="click-button" onclick="document.getElementById('click-button').innerHTML = 'Clicked'" ></div>`;
    const expectedValue = 'Clicked';
    const selector = '#click-button';
    return expect(
      query
        .findElement(selector)
        .imitateClick()
        .getText()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('imitateSubmit works', () => {
    document.body.innerHTML = `<form id="form"
    onsubmit="event.preventDefault(); document.getElementById('form-div').innerHTML = 'On Submit Triggered'" >
    <div id="form-div"></div>
</form>`;
    const expectedValue = 'On Submit Triggered';
    const selector = '#form';
    const sub = '#form-div';
    return expect(
      query
        .findElement(selector)
        .imitateSubmit()
        .findElement(sub)
        .getText()
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('imitateClear works', () => {
    document.body.innerHTML = `<input id="clear-value-0" value="Default value"></input>`;
    const expectedValue = '';
    const selector = '#clear-value-0';
    return expect(
      query
        .findElement(selector)
        .imitateClear()
        .getAttribute('value')
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('imitateAppendText works', () => {
    document.body.innerHTML = `<input id="clear-value-0" value="Default value"></input>`;
    const text = ' some text to append';
    const expectedValue = 'Default value some text to append';
    const selector = '#clear-value-0';
    return expect(
      query
        .findElement(selector)
        .imitateAppendText(text)
        .getAttribute('value')
        .perform()
    ).resolves.toBe(expectedValue);
  });

  it('imitateSetText works', () => {
    document.body.innerHTML = `<input id="clear-value-0" value="Default value"></input>`;
    const text = 'some text to set';
    const expectedValue = 'some text to set';
    const selector = '#clear-value-0';
    return expect(
      query
        .findElement(selector)
        .imitateSetText(text)
        .getAttribute('value')
        .perform()
    ).resolves.toBe(expectedValue);
  });

  describe('given DomLibrary is mocked', () => {
    beforeAll(() => {
      const domLibrary = new DomLibrary();
      domLibrary.scrollIntoView = jest.fn();
      query = new Query({
        executor: () => Promise.resolve(),
        query: new QueryBuilder(),
        config: {
          minPollPeriodMilliseconds: 10,
          pollTimes: 5,
          waitTimeoutMilliseconds: 5000,
          shouldLog: false
        },
        library: domLibrary
      });

      document.body.innerHTML = `<div id="id"></div>`;
    });

    describe('call to scrollIntoView', () => {
      it('should delegate to DomLibrary.scrollIntoView', async () => {
        await query
          .findElement('#id')
          .scrollIntoView()
          .perform();
      });
    });
  });
});
