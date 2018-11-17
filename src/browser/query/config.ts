import { IConfig } from '../../shared/query';
import * as Errors from '../../shared/errors';

export const defaultConfig: Readonly<IConfig> = Object.freeze({
  waitTimeoutMilliseconds: 5000,
  minPollPeriodMilliseconds: 10,
  pollTimes: 5,
  shouldLog: false
});

export const validateConfig = (config: IConfig) => {
  if (!config || typeof config !== 'object') {
    throw new Errors.ArgumentError(
      `'config' is a mandatory parameter that is expected to be an object`
    );
  }
  if (typeof config.waitTimeoutMilliseconds !== 'number') {
    throw new Errors.ArgumentError(
      `'waitTimeoutMilliseconds' is expected to be a positive number`
    );
  }
  if (typeof config.minPollPeriodMilliseconds !== 'number') {
    throw new Errors.ArgumentError(
      `'minPollPeriodMilliseconds' is expected to be a positive number`
    );
  }
  if (typeof config.pollTimes !== 'number') {
    throw new Errors.ArgumentError(
      `'pollTimes' is expected to be a positive number`
    );
  }
  if (config.minPollPeriodMilliseconds > config.waitTimeoutMilliseconds) {
    throw new Errors.ArgumentError(
      `'minPollPeriodMilliseconds' (${
        config.minPollPeriodMilliseconds
      }ms) cannot` +
        ` be greater than 'waitTimeoutMilliseconds' (${
          config.waitTimeoutMilliseconds
        }ms)`
    );
  }
  if (config.pollTimes < 2) {
    throw new Errors.ArgumentError(
      `'pollTimes' (${config.pollTimes}) cannot` + ` be less than 2`
    );
  }
};
