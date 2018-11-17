import * as selenium from 'selenium-webdriver';
import { describeBrowserTests } from '../utils/browser-tests-config';
import { LibraryInstaller } from '../../src/node/library-installer';
import { Query, ElementQuery } from '../../src/node/query';
import { ArgumentError, NoSuchElementError } from '../../src/shared/errors';

describe('Query', () => {
  describeBrowserTests(testDataBuilder => {
    let name: string;
    let driver: selenium.ThenableWebDriver;
    let query: Query;
    let installer: LibraryInstaller;
    let testPagePath: string;
    beforeAll(async () => {
      const result = await testDataBuilder();
      name = result.name;
      driver = result.driver;
      query = result.query;
      installer = result.installer;
      testPagePath = result.testPagePath;

      expect(query).toBeInstanceOf(Query);
    });

    it('created when installed', async () => {
      expect(query).toBeInstanceOf(Query);

      const isInstalled = await installer.isInstalled();
      expect(isInstalled).toBe(true);
    });

    it('when complex query performed with invalid query parameters it rejects', async () => {
      const outerSelector = '#with-children';
      const invalidSelector = ')(&*^&*^#$!';
      const innerSelector = '#inner';
      try {
        await query
          .findElement(outerSelector)
          .findElement(invalidSelector)
          .findElement(innerSelector)
          .perform();
        fail('Expected to throw!');
      } catch (err) {
        expect(err).toBeInstanceOf(ArgumentError);
      }
    });

    describe('findElement', () => {
      it('works with a valid selector', async () => {
        const outerSelector = '#valid';

        const result = await query.findElement(outerSelector).perform();

        expect(result).toBeInstanceOf(selenium.WebElement);
      });

      it('when performed with invalid query parameters it rejects, similar to WebDriver', async () => {
        const invalidSelector = ')(&*^&*^#$!';

        try {
          await query.findElement(invalidSelector).perform();
          fail('Expected to throw');
        } catch (err) {
          expect(err).toBeInstanceOf(ArgumentError);
        }

        try {
          await driver.findElement(selenium.By.css(invalidSelector));
          fail('Expected to throw');
        } catch (err) {
          expect(err).toBeInstanceOf(selenium.error.WebDriverError);
        }
      });

      it('fails when selector identifies no elements, similar to WebDriver', async () => {
        const invalidSelector = '#invalid';

        const queryResult = query.findElement(invalidSelector).perform();

        await expect(queryResult).rejects.toBeInstanceOf(NoSuchElementError);

        const driverResult = driver.findElement(
          selenium.By.css(invalidSelector)
        );
        await expect(driverResult).rejects.toBeInstanceOf(
          selenium.error.NoSuchElementError
        );
      });

      it('returns first when multiple elements match, similar to WebDriver', () => {
        const outerSelector = '.target';
        return expect(query.findElement(outerSelector).perform())
          .resolves.toBeInstanceOf(selenium.WebElement)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(outerSelector))
            ).resolves.toBeInstanceOf(selenium.WebElement);
          });
      });

      it('findElement from ElementQuery works, similar to WebDriver', async () => {
        const outerSelector = '#with-children';
        const childrenSelector = '#child1';

        const queryElement = await query
          .findElement(selenium.By.css(outerSelector))
          .findElement(selenium.By.css(childrenSelector))
          .perform();

        expect(queryElement).toBeInstanceOf(selenium.WebElement);

        const driverElement = await driver
          .findElement(selenium.By.css(outerSelector))
          .findElement(selenium.By.css(childrenSelector));

        expect(driverElement).toBeInstanceOf(selenium.WebElement);

        const queryId = await queryElement.getId();
        const driverId = await driverElement.getId();

        expect(queryId).toBe(driverId);
      });
    });

    describe('exists', () => {
      it('works with a valid selector', () => {
        const outerSelector = '#valid';
        return expect(
          query
            .findElement(outerSelector)
            .exists()
            .perform()
        ).resolves.toBe(true);
      });

      it('when performed with invalid query parameters it rejects, similar to WebDriver', () => {
        const invalidSelector = ')(&*^&*^#$!';
        return expect(
          query
            .findElement(invalidSelector)
            .exists()
            .perform()
        ).rejects.toBeInstanceOf(ArgumentError);
      });

      it('when selector identifies no elements, it returns false', () => {
        const invalidSelector = '#invalid';
        return expect(
          query
            .findElement(invalidSelector)
            .exists()
            .perform()
        ).resolves.toBe(false);
      });

      it('returns true when multiple elements match', () => {
        const outerSelector = '.target';
        return expect(
          query
            .findElement(selenium.By.css(outerSelector))
            .exists()
            .perform()
        ).resolves.toBe(true);
      });
    });

    describe('findElements', () => {
      it('findElements works with a valid selector, similar to WebDriver', () => {
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
                  expect(element).toBeInstanceOf(selenium.WebElement);
                });
              }
              return Promise.resolve(elements);
            })
        )
          .resolves.toBeInstanceOf(Array)
          .then(() => {
            return expect(
              driver
                .findElements(selenium.By.css(outerSelector))
                .then(elements => {
                  expect(elements).toBeInstanceOf(Array);
                  expect(elements.length).toBe(2);
                  if (elements && elements instanceof Array) {
                    elements.map(element => {
                      expect(element).toBeInstanceOf(selenium.WebElement);
                    });
                  }
                  return Promise.resolve(elements);
                })
            ).resolves.toBeInstanceOf(Array);
          });
      });

      it('findElements works with a single element, similar to WebDriver', () => {
        const outerSelector = '.single';
        return expect(
          query
            .findElements(outerSelector)
            .perform()
            .then(elements => {
              expect(elements).toBeInstanceOf(Array);
              expect(elements.length).toBe(1);
              if (elements && elements instanceof Array) {
                elements.map(element => {
                  expect(element).toBeInstanceOf(selenium.WebElement);
                });
              }
              return Promise.resolve(elements);
            })
        )
          .resolves.toBeInstanceOf(Array)
          .then(() => {
            expect(
              driver
                .findElements(selenium.By.css(outerSelector))
                .then(elements => {
                  expect(elements).toBeInstanceOf(Array);
                  expect(elements.length).toBe(1);
                  if (elements && elements instanceof Array) {
                    elements.map(element => {
                      expect(element).toBeInstanceOf(selenium.WebElement);
                    });
                  }
                  return Promise.resolve(elements);
                })
            ).resolves.toBeInstanceOf(Array);
          });
      });

      it('findElements from ElementQuery works, similar to WebDriver', async () => {
        const outerSelector = '#with-children';
        const childrenSelector = '.child';

        const queryElements = await query
          .findElement(outerSelector)
          .findElements(childrenSelector)
          .perform();

        expect(queryElements).toBeInstanceOf(Array);
        expect(queryElements.length).toBe(2);

        const queryElementIds = await Promise.all(
          queryElements.map(element => {
            expect(element).toBeInstanceOf(selenium.WebElement);
            return element.getId();
          })
        );

        const driverElements = await driver
          .findElement(selenium.By.css(outerSelector))
          .findElements(selenium.By.css(childrenSelector));

        expect(driverElements).toBeInstanceOf(Array);
        expect(driverElements.length).toBe(2);

        const driverElementIds = await Promise.all(
          driverElements.map(element => {
            expect(element).toBeInstanceOf(selenium.WebElement);
            return element.getId();
          })
        );

        expect(queryElementIds).toEqual(driverElementIds);
      });

      it('findElements from ElementQuery works for single element, similar to WebDriver', async () => {
        const outerSelector = '#with-children';
        const childrenSelector = '#child1';

        const queryElements = await query
          .findElement(selenium.By.css(outerSelector))
          .findElements(selenium.By.css(childrenSelector))
          .perform();

        expect(queryElements).toBeInstanceOf(Array);
        expect(queryElements.length).toBe(1);

        const queryElementIds = await Promise.all(
          queryElements.map(element => {
            expect(element).toBeInstanceOf(selenium.WebElement);
            return element.getId();
          })
        );

        const driverElements = await driver
          .findElement(selenium.By.css(outerSelector))
          .findElements(selenium.By.css(childrenSelector));

        expect(driverElements).toBeInstanceOf(Array);
        expect(driverElements.length).toBe(1);

        const driverElementIds = await Promise.all(
          driverElements.map(element => {
            expect(element).toBeInstanceOf(selenium.WebElement);
            return element.getId();
          })
        );

        expect(queryElementIds).toEqual(driverElementIds);
      });
    });

    describe('getAttribute', () => {
      it('getAttribute works for existing attribute, similar to WebDriver', () => {
        const attributeName = 'data-something';
        const attributeValue = 'attribute-value';
        const selector = '#id-attr';
        return expect(
          query
            .findElement(selector)
            .getAttribute(attributeName)
            .perform()
            .catch(err => {
              return Promise.reject(err);
            })
        )
          .resolves.toBe(attributeValue)
          .then(() => {
            return expect(
              driver
                .findElement(selenium.By.css(selector))
                .getAttribute(attributeName)
                .catch(err => {
                  return Promise.reject(err);
                })
            ).resolves.toBe(attributeValue);
          });
      });

      it('getAttribute returns null for non-existing attribute, similar to WebDriver', () => {
        const anotherAttributeName = 'data-another';
        const expectedValue = null;
        const selector = '#id-attr';
        return expect(
          query
            .findElement(selector)
            .getAttribute(anotherAttributeName)
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver
                .findElement(selenium.By.css(selector))
                .getAttribute(anotherAttributeName)
            ).resolves.toBe(expectedValue);
          });
      });

      it('getAttribute returns null for invalid attribute name, similar to WebDriver', () => {
        const invalidAttributeName = 'ab%^#%&*&(**)((_r<>';
        const expectedValue = null;
        const selector = '#id-attr';
        return expect(
          query
            .findElement(selector)
            .getAttribute(invalidAttributeName)
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver
                .findElement(selenium.By.css(selector))
                .getAttribute(invalidAttributeName)
                .catch(err => {
                  // NOTE: Edge workaround
                  if (
                    err.message.indexOf(
                      'HTTP Error 400. The request URL is invalid.'
                    ) >= 0
                  ) {
                    return null;
                  }
                  return Promise.reject(err);
                })
            ).resolves.toBe(expectedValue);
          });
      });

      const attributesAndValues = {
        '#attributes-test': {
          disabled: null,
          selected: 'true',
          class: 'some-class'
        },
        '#attributes-test-2': {
          disabled: 'true',
          selected: null,
          style: 'width: 100%;'
        },
        '#empty-attribute': {
          ['data-empty']: ''
        },
        '#value-attribute-0': {
          value: 'Something'
        },
        '#value-attribute-1': {
          value: 'Value set by JS'
        },
        '#value-attribute-2': {
          value: 'Value set by JS'
        }
      };

      type Props = keyof typeof attributesAndValues;

      const selectors: Props[] = Object.keys(attributesAndValues) as Props[];

      for (const selector of selectors) {
        const props = Object.keys(attributesAndValues[selector]);
        for (const prop of props) {
          it(`getAttribute returns expected value for '${prop}' (given selector '${selector}'), similar to WebDriver`, async () => {
            const invalidAttributeName = prop;

            const expectedValue = (attributesAndValues[selector] as any)[prop];

            const queryVal = await query
              .findElement(selector)
              .getAttribute(invalidAttributeName)
              .perform();

            expect(queryVal).toBe(expectedValue);

            const driverVal = await driver
              .findElement(selenium.By.css(selector))
              .getAttribute(invalidAttributeName);

            expect(driverVal).toBe(expectedValue);
          });
        }
      }
    });

    describe('getText', () => {
      it('getText works for empty element, similar to WebDriver', () => {
        const expectedValue = '';
        const selector = '#valid';
        return expect(
          query
            .findElement(selector)
            .getText()
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(selector)).getText()
            ).resolves.toBe(expectedValue);
          });
      });

      it('getText works for non-empty element, similar to WebDriver', () => {
        const expectedValue = 'Non empty element';
        const selector = '#id-non-empty';
        return expect(
          query
            .findElement(selector)
            .getText()
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(selector)).getText()
            ).resolves.toBe(expectedValue);
          });
      });

      it('getText works for multi-line element, similar to WebDriver', async () => {
        // NOTE: Different ways to handle
        // multilines in different browsers:
        const expectedValues = [
          // edge
          `Hello
There This is a test and another
br `,
          // firefox and chrome
          `Hello
There This is a test and another
br`,
          // safari:
          `Hello
        There
            This is a test
        and anotherbr`
        ];
        const selector = '#multiline-text';
        const result = await query
          .findElement(selector)
          .getText()
          .perform();
        expect(expectedValues).toContain(result);
        const driverResult = await driver
          .findElement(selenium.By.css(selector))
          .getText();
        expect(expectedValues).toContain(driverResult);
      });
    });

    describe('getCssValue', () => {
      it('getCssValue works for element with no style, similar to WebDriver', () => {
        const prop = 'width';
        const regex = /\d+px/;
        const selector = '#valid';
        return expect(
          query
            .findElement(selector)
            .getCssValue(prop)
            .perform()
        )
          .resolves.toMatch(regex)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(selector)).getCssValue(prop)
            ).resolves.toMatch(regex);
          });
      });

      it('getCssValue works for element with style, similar to WebDriver', () => {
        const prop = 'width';
        const expectedValue = '5px';
        const selector = '#id-css';
        return expect(
          query
            .findElement(selector)
            .getCssValue(prop)
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(selector)).getCssValue(prop)
            ).resolves.toBe(expectedValue);
          });
      });
    });

    describe('given elements with different display properties', () => {
      const selectorsWithDescription = {
        '#visible': 'visible elements',
        '#none': 'none elements',
        '#hidden': 'hidden elements',
        '#collapsed': 'collapsed elements',
        '#item-36': 'elements outside viewport'
      };

      type Props = keyof typeof selectorsWithDescription;
      const selectors: Props[] = Object.getOwnPropertyNames(
        selectorsWithDescription
      ) as Props[];

      for (const selector of selectors) {
        const description = selectorsWithDescription[selector];

        it(`getLocation works for ${description}, similar to WebDriver`, async () => {
          const location = await query.findElement(selector).getLocation();

          expect(location).toHaveProperty('x');
          expect(location).toHaveProperty('y');

          const element = await driver.findElement(selenium.By.css(selector));

          if ('getLocation' in element) {
            const driverLocation = await element.getLocation();
            expect(Math.abs(driverLocation.x - location.x)).toBeLessThan(1);
            expect(Math.abs(driverLocation.y - location.y)).toBeLessThan(1);
          }
        });

        it(`getRect works for ${description}, similar to WebDriver`, async () => {
          const queryResult = await query
            .findElement(selector)
            .getRect()
            .perform();

          expect(queryResult).toHaveProperty('width');
          expect(queryResult).toHaveProperty('height');
          expect(queryResult).toHaveProperty('x');
          expect(queryResult).toHaveProperty('y');

          const element = await driver.findElement(selenium.By.css(selector));

          if ('getRect' in element) {
            // @ts-ignore Only in Selenium Web Driver 4.0
            const driverResult = await element.getRect();

            if (
              name.indexOf('chrome') !== -1 &&
              description.indexOf('none') !== -1
            ) {
              // NOTE: Chrome behavior for none elements doesn't quite match
              return;
            }

            const xdiff = Math.abs(queryResult.x - driverResult.x);
            const ydiff = Math.abs(queryResult.y - driverResult.y);
            const widthDiff = Math.abs(queryResult.width - driverResult.width);
            const heightDiff = Math.abs(
              queryResult.height - driverResult.height
            );

            expect(xdiff).toBeLessThan(1);
            expect(ydiff).toBeLessThan(1);
            expect(widthDiff).toBeLessThan(1);
            expect(heightDiff).toBeLessThan(1);
          }
        });

        it(`getSize works for ${description}, similar to WebDriver`, async () => {
          const queryResult = await query
            .findElement(selector)
            .getSize()
            .perform();

          expect(queryResult).toHaveProperty('width');
          expect(queryResult).toHaveProperty('height');

          const element = await driver.findElement(selenium.By.css(selector));

          if ('getSize' in element) {
            const driverResult = await element.getSize();

            if (
              name.indexOf('chrome') !== -1 &&
              description.indexOf('none') !== -1
            ) {
              // NOTE: Chrome behavior for none elements doesn't quite match
              return;
            }

            const widthDiff = Math.abs(queryResult.width - driverResult.width);
            const heightDiff = Math.abs(
              queryResult.height - driverResult.height
            );

            expect(widthDiff).toBeLessThan(1);
            expect(heightDiff).toBeLessThan(1);
          }
        });

        describe('when scrolling to the elements', () => {
          it(`getLocation works for ${description}, similar to WebDriver`, async () => {
            const location = await query
              .findElement(selector)
              .scrollIntoView()
              .getLocation();

            expect(location).toHaveProperty('x');
            expect(location).toHaveProperty('y');

            const element = await driver.findElement(selenium.By.css(selector));

            if ('getLocation' in element) {
              const driverLocation = await element.getLocation();
              expect(Math.abs(driverLocation.x - location.x)).toBeLessThan(1);
              expect(Math.abs(driverLocation.y - location.y)).toBeLessThan(1);
            }
          });

          it(`getSize works for ${description}, similar to WebDriver`, async () => {
            const queryResult = await query
              .findElement(selector)
              .scrollIntoView()
              .getSize()
              .perform();

            expect(queryResult).toHaveProperty('width');
            expect(queryResult).toHaveProperty('height');

            const element = await driver.findElement(selenium.By.css(selector));

            if ('getSize' in element) {
              const driverResult = await element.getSize();

              if (
                name.indexOf('chrome') !== -1 &&
                description.indexOf('none') !== -1
              ) {
                // NOTE: Chrome behavior for none elements doesn't quite match
                return;
              }

              const widthDiff = Math.abs(
                queryResult.width - driverResult.width
              );
              const heightDiff = Math.abs(
                queryResult.height - driverResult.height
              );

              expect(widthDiff).toBeLessThan(1);
              expect(heightDiff).toBeLessThan(1);
            }
          });
        });
      }
    });

    describe('given elements with different display properties', () => {
      const selectorsWithDescription = {
        '#visible': {
          description: 'visible elements',
          value: true,
          text: `I'm a visible span`
        },
        '#none': {
          description: 'none elements',
          value: false,
          text: ''
        },
        '#hidden': {
          description: 'hidden elements',
          value: false,
          text: ''
        },
        '#collapsed': {
          description: 'collapsed elements',
          value: true,
          text: `I'm a collapsed span`
        }
      };

      type Props = keyof typeof selectorsWithDescription;
      const selectors: Props[] = Object.getOwnPropertyNames(
        selectorsWithDescription
      ) as Props[];

      for (const selector of selectors) {
        const scenario = selectorsWithDescription[selector];
        const description = scenario.description;
        const expectedIsDisplayed = scenario.value;
        const expectedText = scenario.text;

        it(`isDisplayed works for ${description}, similar to WebDriver`, async () => {
          const isDisplayedQuery = await query
            .findElement(selector)
            .isDisplayed()
            .perform();

          expect(isDisplayedQuery).toBe(expectedIsDisplayed);

          const isDisplayedDriver = await driver
            .findElement(selenium.By.css(selector))
            .isDisplayed();

          expect(isDisplayedDriver).toBe(expectedIsDisplayed);

          const textQuery = await query
            .findElement(selenium.By.css(selector))
            .getText();

          expect(textQuery).toBe(expectedText);

          const textDriver = await driver
            .findElement(selenium.By.css(selector))
            .getText();

          expect(textDriver).toBe(expectedText);
        });
      }
    });

    describe('getTagName', () => {
      it('getTagName works, similar to WebDriver', () => {
        const expectedValue = 'div';
        const selector = '#valid';
        return expect(
          query
            .findElement(selector)
            .getTagName()
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(selector)).getTagName()
            ).resolves.toBe(expectedValue);
          });
      });

      it('getTagName works for strange case, similar to WebDriver', () => {
        const expectedValue = 'span';
        const selector = '#tag-name-0';
        return expect(
          query
            .findElement(selector)
            .getTagName()
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(selector)).getTagName()
            ).resolves.toBe(expectedValue);
          });
      });

      it('getTagName works for stranger case, similar to WebDriver', () => {
        const expectedValue = 'span';
        const selector = '#tag-name-1';
        return expect(
          query
            .findElement(selector)
            .getTagName()
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return expect(
              driver.findElement(selenium.By.css(selector)).getTagName()
            ).resolves.toBe(expectedValue);
          });
      });
    });

    describe('isEnabled', () => {
      const targetWithDescription = {
        '#valid': {
          description: 'when element is enabled',
          expectedValue: true
        },
        '#id-disabled-0': {
          description: 'when element is disabled using `disabled="disabled"`',
          expectedValue: false
        },
        '#id-disabled-1': {
          description: 'when element is disabled using `disabled`',
          expectedValue: false
        },
        '#id-disabled-2': {
          description: 'when element is disabled using `disaBled`',
          expectedValue: false
        }
      };

      type Props = keyof typeof targetWithDescription;
      const props: Props[] = Object.getOwnPropertyNames(
        targetWithDescription
      ) as Props[];

      for (const prop of props) {
        const selector = prop;
        const description = targetWithDescription[prop].description;
        const expectedValue = targetWithDescription[prop].expectedValue;

        it(`works ${description}, similar to WebDriver`, () => {
          return expect(
            query
              .findElement(selector)
              .isEnabled()
              .perform()
          )
            .resolves.toBe(expectedValue)
            .then(() => {
              return expect(
                driver.findElement(selenium.By.css(selector)).isEnabled()
              ).resolves.toBe(expectedValue);
            });
        });
      }
    });

    describe('isSelected', () => {
      const targetWithDescription = {
        '#id-not-selected': {
          description: 'when element is not selected',
          expectedValue: false
        },
        '#id-selected-0': {
          description: 'when element is selected using `selected="selected"`',
          expectedValue: true
        },
        '#id-selected-1': {
          description: 'when element is selected using `selected`',
          expectedValue: true
        }
      };

      type Props = keyof typeof targetWithDescription;
      const props: Props[] = Object.getOwnPropertyNames(
        targetWithDescription
      ) as Props[];

      for (const prop of props) {
        const selector = prop;
        const description = targetWithDescription[prop].description;
        const expectedValue = targetWithDescription[prop].expectedValue;

        it(`works ${description}, similar to WebDriver`, () => {
          return expect(
            query
              .findElement(selector)
              .isSelected()
              .perform()
          )
            .resolves.toBe(expectedValue)
            .then(() => {
              return expect(
                driver.findElement(selenium.By.css(selector)).isSelected()
              ).resolves.toBe(expectedValue);
            });
        });
      }
    });

    it('innerHTML works', () => {
      const expectedValue = `<p>Hello world!</p>`;
      const selector = '#id-inner';
      return expect(
        query
          .findElement(selector)
          .innerHTML()
          .perform()
      ).resolves.toBe(expectedValue);
    });

    it('class works', () => {
      const expectedValue = 'some-long-class another-class';
      const selector = '#id-class';
      return expect(
        query
          .findElement(selector)
          .class()
          .perform()
      ).resolves.toBe(expectedValue);
    });

    it('class works when empty', () => {
      const expectedValue = '';
      const selector = '#id-no-class';
      return expect(
        query
          .findElement(selector)
          .class()
          .perform()
      ).resolves.toBe(expectedValue);
    });

    describe('given actions', () => {
      beforeEach(async () => {
        await query.get(testPagePath);
      });

      it('imitateClick works, similar to WebDriver', () => {
        const expectedValue = 'Clicked';
        const selector = '#click-button';
        return expect(
          query
            .findElement(selector)
            .imitateClick()
            .getText()
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return driver.navigate().refresh();
          })
          .then(() => {
            return expect(
              driver
                .findElement(selenium.By.css(selector))
                .click()
                .then(() => {
                  return driver
                    .findElement(selenium.By.css(selector))
                    .getText();
                })
            ).resolves.toBe(expectedValue);
          });
      });

      it('imitateSubmit works, similar to WebDriver', async () => {
        const expectedValue = 'On Submit Triggered';
        const selector = '#form';
        const sub = '#form-div';

        const queryResult = await query
          .findElement(selector)
          .imitateSubmit()
          .findElement(sub)
          .getText()
          .perform();

        expect(queryResult).toBe(expectedValue);

        await driver.get(testPagePath);

        const element = await driver.findElement(
          selenium.By.css('#form-input')
        );
        await element.click();

        const driverResult = await driver
          .findElement(selenium.By.css(sub))
          .getText();

        expect(driverResult).toBe(expectedValue);
      });

      it('imitateClear works, similar to WebDriver', () => {
        const expectedValue = '';
        const selector = '#clear-value-0';
        return expect(
          query
            .findElement(selector)
            .imitateClear()
            .getAttribute('value')
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return driver.navigate().refresh();
          })
          .then(() => {
            return expect(
              driver
                .findElement(selenium.By.css(selector))
                .clear()
                .then(() => {
                  return driver
                    .findElement(selenium.By.css(selector))
                    .getAttribute('value');
                })
            ).resolves.toBe(expectedValue);
          });
      });

      it('imitateAppendText works, similar to WebDriver', () => {
        const text = 'value to append';
        const expectedValue = 'Some value to append';
        const selector = '#append-value-0';
        return expect(
          query
            .findElement(selector)
            .imitateAppendText(text)
            .getAttribute('value')
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return driver.get(testPagePath);
          })
          .then(() => {
            return expect(
              driver
                .findElement(selenium.By.css(selector))
                .then(el => {
                  return el
                    .click()
                    .then(() => el.sendKeys(selenium.Key.END, text));
                })
                .then(() => {
                  return driver
                    .findElement(selenium.By.css(selector))
                    .getAttribute('value');
                })
            ).resolves.toBe(expectedValue);
          });
      });

      it('imitateSetText works, similar to WebDriver', () => {
        const text = 'value to set';
        const expectedValue = 'value to set';
        const selector = '#append-value-0';
        return expect(
          query
            .findElement(selector)
            .imitateSetText(text)
            .getAttribute('value')
            .perform()
        )
          .resolves.toBe(expectedValue)
          .then(() => {
            return driver.navigate().refresh();
          })
          .then(() => {
            return expect(
              driver
                .findElement(selenium.By.css(selector))
                .clear()
                .then(() => {
                  return driver
                    .findElement(selenium.By.css(selector))
                    .sendKeys(text);
                })
                .then(() => {
                  return driver
                    .findElement(selenium.By.css(selector))
                    .getAttribute('value');
                })
            ).resolves.toBe(expectedValue);
          });
      });
    });

    describe('execute', () => {
      beforeEach(async () => {
        await query.get(testPagePath);
      });

      describe('given return statement and simple string literal', () => {
        const script = `return 'A value'`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          expect(driverResult).toBe('A value');

          const queryResult = await query
            .execute(script)
            .asString()
            .perform();
          expect(queryResult).toBe('A value');
        });
      });

      describe('given a lambda which returns string literal', () => {
        const script = () => 'A value';

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          expect(driverResult).toBe('A value');

          const queryResult = await query.execute(script).perform();
          expect(queryResult).toBe('A value');
        });
      });

      describe('given a function which returns string literal', () => {
        function script() {
          return 'A value';
        }

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          expect(driverResult).toBe('A value');

          const queryResult = await query.execute(script).perform();
          expect(queryResult).toBe('A value');
        });
      });

      describe('given invalid string literal', () => {
        const script = `'A value`;

        it('should throw, similar to WebDriver', async () => {
          const driverResult = driver.executeScript(script);
          await expect(driverResult).rejects.toBeInstanceOf(Error);

          const queryResult = query
            .execute(script)
            .asString()
            .perform();
          await expect(queryResult).rejects.toBeInstanceOf(Error);
        });
      });

      describe('given no return statement', () => {
        const script = `const x = 'A value';`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          const queryResult = await query.execute(script).perform();
          expect(queryResult).toBe(driverResult);
        });
      });

      describe('given return statement returning a lambda', () => {
        const script = `return () => 'Something'`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          const queryResult = await query.execute(script).perform();

          // NOTE: Due to differences in Object vs pure types
          // processing/serializing between client and server
          // on different browsers, the above edge case might be
          // different on different browser-drivers, hence we do not assert

          // Both of the calls above should resolve though

          // expect(driverResult).toEqual(queryResult);
        });
      });

      describe('given return statement returning a function', () => {
        const script = `return function A() {};`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          const queryResult = await query.execute(script).perform();

          // NOTE: Due to differences in Object vs pure types
          // processing/serializing between client and server
          // on different browsers, the above edge case might be
          // different on different browser-drivers, hence we do not assert

          // Both of the calls above should resolve though

          // expect(driverResult).toEqual(queryResult);
        });
      });

      describe('given return statement returning an object', () => {
        const script = `return { "property": "value" };`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          expect(driverResult).toEqual({ property: 'value' });

          const queryResult = await query.execute(script).perform();
          expect(queryResult).toEqual({ property: 'value' });
        });
      });

      describe('given return statement returning a number', () => {
        const script = `return 42;`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script);
          expect(driverResult).toBe(42);

          const queryResult = await query.execute(script).perform();
          expect(queryResult).toBe(42);
        });
      });

      describe('given return statement returning first parameter', () => {
        const script = `return arguments[0];`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script, 'Value');
          expect(driverResult).toBe('Value');

          const queryResult = await query.execute(script, 'Value').perform();
          expect(queryResult).toBe('Value');
        });
      });

      describe('given return statement returning sum of arguments', () => {
        const script = `return arguments[0] + arguments[1];`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = await driver.executeScript(script, 40, 2);
          expect(driverResult).toBe(42);

          const queryResult = await query.execute(script, 40, 2).perform();
          expect(queryResult).toBe(42);
        });
      });

      describe('given return statement throwing exception', () => {
        const script = `throw new Error('Some error happened')`;

        it('should work, similar to WebDriver', async () => {
          const driverResult = driver.executeScript(script);
          await expect(driverResult).rejects.toBeInstanceOf(Error);

          const queryResult = query
            .execute(script)
            .asString()
            .perform();
          await expect(queryResult).rejects.toBeInstanceOf(Error);
        });
      });

      describe('given element query', () => {
        let elementQuery: ElementQuery;
        beforeAll(() => {
          elementQuery = query.findElement('#valid');
        });

        describe('given return statement and simple string literal', () => {
          const script = `return 'A value'`;

          it('should work', async () => {
            const queryResult = await elementQuery
              .execute(script)
              .asString()
              .perform();
            expect(queryResult).toBe('A value');
          });
        });

        describe('given invalid string literal', () => {
          const script = `'A value`;

          it('should throw', async () => {
            const queryResult = elementQuery
              .execute(script)
              .asString()
              .perform();
            await expect(queryResult).rejects.toBeInstanceOf(Error);
          });
        });

        describe('given no return statement', () => {
          const script = `console.log('A value');`;

          it('should work', async () => {
            const queryResult = await elementQuery.execute(script).perform();
            expect(queryResult).toBe(null);
          });
        });

        describe('given return statement returning an object', () => {
          const script = `return { "property": "value" };`;

          it('should work same as driver', async () => {
            const queryResult = await elementQuery.execute(script).perform();
            expect(queryResult).toEqual({ property: 'value' });
          });
        });

        describe('given return statement returning a number', () => {
          const script = `return 42;`;

          it('should work same as driver', async () => {
            const queryResult = await elementQuery.execute(script).perform();
            expect(queryResult).toBe(42);
          });
        });

        describe('given return statement returning first parameter', () => {
          const script = `return arguments[0];`;

          it('should work', async () => {
            const queryResult = await elementQuery
              .execute(script, 'Value')
              .perform();
            expect(queryResult).toBeInstanceOf(selenium.WebElement);
          });
        });

        describe('given return statement returning sum of second and third arguments', () => {
          const script = `return arguments[1] + arguments[2];`;

          it('should work', async () => {
            const queryResult = await elementQuery
              .execute(script, 40, 2)
              .perform();
            expect(queryResult).toBe(42);
          });
        });

        describe('given return statement throwing exception', () => {
          const script = `throw new Error('Some error happened')`;

          it('should work', async () => {
            const queryResult = elementQuery
              .execute(script)
              .asString()
              .perform();
            await expect(queryResult).rejects.toBeInstanceOf(Error);
          });
        });
      });
    });

    describe('when the page refresh is forced', () => {
      beforeEach(async () => {
        await query
          .findElement('#force-reload-button')
          .scrollIntoView()
          .imitateClick()
          .expectPageReload();
      });

      it('the library is not installed', async () => {
        const isInstalled = await installer.isInstalled();
        expect(isInstalled).toBe(false);
      });

      it('we can initiate another query anyway, because the library is installed auto-magically', async () => {
        const numberOfRows = await query
          .findElements('.row')
          .count()
          .perform();
        expect(numberOfRows).toBe(8);
      });
    });
  });
});
