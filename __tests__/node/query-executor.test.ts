import { QueryExecutor } from '../../src/node/query';
import { QueryBuilder, IDriver } from '../../src/shared/query';
import {
  ArgumentError,
  ExecutionError,
  ErrorLike,
  QueryError
} from '../../src/shared/errors';
import * as selenium from 'selenium-webdriver';

describe('QueryExecutor', () => {
  const precondition = () => Promise.resolve();

  // tslint:disable-next-line
  (window as any)["sbq"] = { Query: {} };
  const expectedScript = (
    query: string = '',
    withConstructorArg: boolean = false
  ) => {
    const sub = `new sbq.Query(${
      withConstructorArg ? '_args[0]' : ''
    })${query}`;
    const script = `
    try {
      var _args = arguments;
      var cb = _args[_args.length - 1];
      if (!${QueryBuilder.isInstalledExpression}) {
          cb({
            error: {
              name: 'BootstrapError',
              message: 'The query library doesn\\\'t seem to have been installed, please use library installer'
            }
          });
          return;
      }
      ${sub}
      .perform()
      .then((value) => {
          cb({ value: value, type: (typeof value) });
      })
      .catch((err) => {
          cb({ error: new sbq.Query.ErrorLike(err) });
      })
    } catch(err) {
      cb({
        error: {
          name: err.name,
          message: err.message,
          originalMessage: err.message,
          stack: err.stack
        }
      });
    }`;
    return script;
  };

  describe('given JavaScript environment', () => {
    describe('QueryExecutor constructor', () => {
      it('given no driver should throw', async () => {
        expect(() => {
          // @ts-ignore
          return new QueryExecutor();
        }).toThrowError(ArgumentError);
      });

      it('given invalid driver should throw', async () => {
        expect(() => {
          // @ts-ignore
          return new QueryExecutor({});
        }).toThrowError(ArgumentError);
      });
    });

    describe('given QueryExecutor instance', () => {
      const executor = new QueryExecutor(
        {
          executeAsyncScript: jest.fn().mockReturnValue(
            Promise.resolve({
              value: null
            })
          ),
          executeScript: jest.fn(() => {
            throw new Error('Should not be called!');
          }),
          get: jest.fn(() => {
            throw new Error('Should not be called!');
          })
        },
        precondition
      );

      it('given undefined query perform should throw', async () => {
        expect(() => {
          // @ts-ignore
          return executor.perform(undefined);
        }).toThrowError(Error);
      });
    });
  });

  describe('perform', () => {
    describe('given some query and executeAsyncScript dependency resolves', () => {
      const query = new QueryBuilder().appendCall('someCall');

      let driver: IDriver;
      beforeEach(() => {
        driver = {
          executeAsyncScript: jest.fn().mockReturnValue(
            Promise.resolve({
              value: null
            })
          ),
          executeScript: jest.fn(() => {
            throw new Error('Should not be called!');
          }),
          get: jest.fn(() => {
            throw new Error('Should not be called!');
          })
        };
      });

      describe('given non-empty config', () => {
        const config = {
          minPollPeriodMilliseconds: 100
        };

        it('should pass config to the library', async () => {
          const executor = new QueryExecutor(driver, precondition, config);

          await executor.perform(query);

          const script = expectedScript('.someCall()', true);

          expect(driver.executeAsyncScript).toBeCalledWith(script, {
            minPollPeriodMilliseconds: 100
          });
        });
      });

      describe('given empty config', () => {
        it('should pass config to the library', async () => {
          const executor = new QueryExecutor(driver, precondition);

          await executor.perform(query);

          const script = expectedScript('.someCall()', false);

          expect(driver.executeAsyncScript).toBeCalledWith(script);
        });
      });
    });

    describe('given empty query and executeAsyncScript dependency resolves', () => {
      const query = new QueryBuilder();

      let driver: IDriver;
      beforeEach(() => {
        driver = {
          executeAsyncScript: jest.fn().mockReturnValue(
            Promise.resolve({
              value: null
            })
          ),
          executeScript: jest.fn(() => {
            throw new Error('Should not be called!');
          }),
          get: jest.fn(() => {
            throw new Error('Should not be called!');
          })
        };
      });

      it('should pass config to the library', async () => {
        const executor = new QueryExecutor(driver, precondition);

        await executor.perform(query);

        const script = expectedScript();

        expect(driver.executeAsyncScript).toBeCalledWith(script);
      });
    });

    describe('given non-empty query and executeAsyncScript dependency rejects', () => {
      const query = new QueryBuilder().appendCall('someCall');

      let driver: IDriver;
      beforeEach(() => {
        driver = {
          executeAsyncScript: jest.fn().mockRejectedValue(new Error('Oops!')),
          executeScript: jest.fn(() => {
            throw new Error('Should not be called!');
          }),
          get: jest.fn(() => {
            throw new Error('Should not be called!');
          })
        };
      });

      it('should reject with ExecutionError', async () => {
        const executor = new QueryExecutor(driver, precondition);

        await expect(executor.perform(query)).rejects.toBeInstanceOf(
          ExecutionError
        );

        const script = expectedScript('.someCall()');

        expect(driver.executeAsyncScript).toBeCalledWith(script);
      });
    });

    describe('given non-empty query and executeAsyncScript dependency resolves with ErrorLike', () => {
      const query = new QueryBuilder().appendCall('someCall');

      let driver: IDriver;
      beforeEach(() => {
        driver = {
          executeAsyncScript: jest.fn().mockResolvedValue({
            error: new ErrorLike(new Error('Ooooops!'))
          }),
          executeScript: jest.fn(() => {
            throw new Error('Should not be called!');
          }),
          get: jest.fn(() => {
            throw new Error('Should not be called!');
          })
        };
      });

      it('should reject with ExecutionError', async () => {
        const executor = new QueryExecutor(driver, precondition);

        await expect(executor.perform(query)).rejects.toBeInstanceOf(
          QueryError
        );

        const script = expectedScript('.someCall()');

        expect(driver.executeAsyncScript).toBeCalledWith(script);
      });
    });
  });

  describe('locatorToSelector', () => {
    const executor = new QueryExecutor(
      {
        executeAsyncScript: jest.fn().mockReturnValue(Promise.resolve(null)),
        executeScript: jest.fn(() => {
          throw new Error('Should not be called!');
        }),
        get: jest.fn(() => {
          throw new Error('Should not be called!');
        })
      },
      precondition
    );

    describe('given By.css', () => {
      const result = executor.locatorToSelector(selenium.By.css('.class'));
      expect(result).toBe('.class');
    });

    describe('given By.id', () => {
      const result = executor.locatorToSelector(selenium.By.id('ID'));
      expect(result).toBe('*[id="ID"]');
    });

    describe('given By.name', () => {
      const result = executor.locatorToSelector(selenium.By.name('name'));
      expect(result).toBe('*[name="name"]');
    });

    describe('given By.xpath', () => {
      expect(() =>
        executor.locatorToSelector(selenium.By.xpath('/xpath'))
      ).toThrow();
    });

    describe('given By.linkText', () => {
      expect(() =>
        executor.locatorToSelector(selenium.By.linkText('TEXT'))
      ).toThrow();
    });

    describe('given By.partialLinkText', () => {
      expect(() =>
        executor.locatorToSelector(selenium.By.partialLinkText('TEXT'))
      ).toThrow();
    });
  });
});
