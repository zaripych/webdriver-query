import {
  consoleLogger,
  noOpLogger,
  consoleLoggerFactory,
  IAsyncLogger
} from '../../src/shared/logger';
import { Query } from '../../src/browser/query';

// tslint:disable:no-console

describe('logger', () => {
  let logger: IAsyncLogger;
  beforeEach(() => {
    logger = consoleLoggerFactory()();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
    expect(consoleLogger).toBeDefined();
    expect(noOpLogger).toBeDefined();
  });

  describe('given console mocked', () => {
    const { error, info, debug } = console;

    const bindAwareFn = () => {
      const fn = jest.fn();
      fn.bind = () => fn;
      return fn;
    };

    beforeEach(() => {
      console.error = bindAwareFn();
      console.info = bindAwareFn();
      console.debug = bindAwareFn();
    });

    afterAll(() => {
      console.error = error;
      console.info = info;
      console.debug = debug;
    });

    it('error should be called', () => {
      logger.error('A');
      expect(console.error).toBeCalledWith('[0001] A');
      logger.error(() => 'B');
      expect(console.error).toBeCalledWith('[0002] B');
    });

    it('debug should be called', () => {
      logger.debug('A');
      expect(console.debug).toBeCalledWith('[0001] A');
    });

    it('info should be called', () => {
      logger.info('A');
      expect(console.info).toBeCalledWith('[0001] A');
    });

    describe('given query', () => {
      let query: Query;
      beforeEach(() => {
        query = new Query({
          shouldLog: true
        });
      });

      it('should use console logger', () => {
        expect(query.buildingBlock.logger.name).toBe('console');
      });

      it('should use logger when performed', async () => {
        expect(await query.execute(() => false).perform()).toBe(false);
        expect(console.debug).toBeCalled();
      });
    });
  });
});
