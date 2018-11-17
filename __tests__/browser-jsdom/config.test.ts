import { defaultConfig, validateConfig } from '../../src/browser/query/config';

describe('config', () => {
  describe('defaultConfig', () => {
    it('should be defined', () => {
      expect(defaultConfig).toBeDefined();
    });

    it('should be valid', () => {
      expect(() => validateConfig(defaultConfig)).not.toThrow();
    });
  });

  describe('validateConfig', () => {
    describe('when plain JavaScript', () => {
      const validateConfigJS = validateConfig as (arg: any) => void;

      describe('when arg is undefined', () => {
        const arg = undefined;

        it('should throw', () => {
          expect(() => validateConfigJS(arg)).toThrow();
        });
      });

      describe('when arg is empty object {}', () => {
        const arg = {};

        it('should throw', () => {
          expect(() => validateConfigJS(arg)).toThrow();
        });
      });

      describe('when waitTimeoutMilliseconds is not a number', () => {
        const arg = {
          ...defaultConfig,
          waitTimeoutMilliseconds: ''
        };

        it('should throw', () => {
          expect(() => validateConfigJS(arg)).toThrow();
        });
      });

      describe('when minPollPeriodMilliseconds is not a number', () => {
        const arg = {
          ...defaultConfig,
          minPollPeriodMilliseconds: ''
        };

        it('should throw', () => {
          expect(() => validateConfigJS(arg)).toThrow();
        });
      });

      describe('when pollTimes is not a number', () => {
        const arg = {
          ...defaultConfig,
          pollTimes: ''
        };

        it('should throw', () => {
          expect(() => validateConfigJS(arg)).toThrow();
        });
      });
    });

    describe('when minPollPeriodMilliseconds is greater than waitTimeoutMilliseconds', () => {
      const arg = {
        ...defaultConfig,
        minPollPeriodMilliseconds: 100,
        waitTimeoutMilliseconds: 50
      };

      it('should throw', () => {
        expect(() => validateConfig(arg)).toThrow();
      });
    });

    describe('when pollTimes is less than 2', () => {
      const arg = {
        ...defaultConfig,
        pollTimes: 1
      };

      it('should throw', () => {
        expect(() => validateConfig(arg)).toThrow();
      });
    });

    describe('when config is valid', () => {
      const arg = {
        waitTimeoutMilliseconds: 5000,
        minPollPeriodMilliseconds: 100,
        pollTimes: 5,
        shouldLog: false
      };

      it('should not throw', () => {
        expect(() => validateConfig(arg)).not.toThrow();
      });
    });
  });
});
