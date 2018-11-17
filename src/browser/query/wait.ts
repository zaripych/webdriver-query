import * as Errors from '../../shared/errors'
import { QueryBuilder, IInstanceWaitOptions, IAsyncLogger, noOpLogger } from '../../shared'

export { IInstanceWaitOptions }

export interface ICommonWaitOptions {
  shouldIgnoreError?: (err: Error) => boolean
  timeout: number
  pollPeriod: number
  query?: QueryBuilder
  logger?: IAsyncLogger
}

export interface IWaitOptions<Y> extends ICommonWaitOptions {
  condition: () => Promise<Y>
}

export interface ICoreWaitOptions<C, Y> extends ICommonWaitOptions {
  condition: () => Promise<{
    stopWhen: C
    returnWhenStopped: Y | PromiseLike<Y>
  }>
}

export const queryWaitOnce = <T, U>(
  preWait: () => Promise<T>,
  condition: () => Promise<U>,
  waitOptions: { timeout: number; pollPeriod: number },
  query: QueryBuilder,
  logger: IAsyncLogger
) => {
  let waited = false
  let waitErr: Error | null = null

  const waitOnce = () => {
    const waitResult = () => {
      if (waitErr) {
        return Promise.reject(waitErr)
      }
      return preWait()
    }

    if (waited) {
      return waitResult()
    }

    const doWaitOnce = () => {
      waited = true

      return waitFor({
        condition,
        ...waitOptions,
        query,
        logger,
      })
        .then(() => preWait())
        .catch(err => {
          waitErr = err
          return Promise.reject(err)
        })
    }

    return preWait().then(doWaitOnce, doWaitOnce)
  }

  return waitOnce
}

export function waitFor<Y>(options: IWaitOptions<Y>): Promise<Y> {
  return waitForCore({
    condition: () => {
      return options.condition().then(result => {
        return {
          stopWhen: result,
          returnWhenStopped: result,
        }
      })
    },
    shouldIgnoreError: options.shouldIgnoreError,
    timeout: options.timeout,
    pollPeriod: options.pollPeriod,
    query: options.query,
    logger: options.logger,
  })
}

function waitForCore<C, Y>(options: ICoreWaitOptions<C, Y>): Promise<Y> {
  const ignoreAllErrors = () => true
  const ignoreError = options.shouldIgnoreError || ignoreAllErrors

  let timesPolled = 0

  const effectiveTimeout = options.timeout
  const effectivePollPeriod = options.pollPeriod

  const condition = options.condition
  const query = options.query

  const buildTimeoutMessage = () => {
    const message = 'Timeout when waiting for condition to be truthy'
    const additionalInfo = [
      `\n  Timeout:      ${effectiveTimeout / 1000}s`,
      `\n  Poll Period:  ${effectivePollPeriod / 1000}s`,
      `\n  Times Polled: ${timesPolled}`,
    ].join('')
    return !query
      ? `${message}${additionalInfo}`
      : `${message}, when executing a sub-query ${query.buildDescription(1)}${additionalInfo}`
  }

  const mainLogger = options.logger || noOpLogger

  const queryInfo = () => (query ? ` for ${query.buildDescription(1)}` : '')

  const logger = mainLogger.debug(() => `waiting started ${queryInfo()}`)

  let timeoutReached = false
  const timer = setTimeout(() => {
    logger.debug(`timeout has happened ${queryInfo()}`)

    timeoutReached = true
  }, effectiveTimeout)
  const loop = () => {
    const safeCondition = () => {
      try {
        timesPolled += 1
        return condition()
      } catch (exc) {
        return Promise.reject(exc)
      }
    }
    const continueLoop = () => {
      return new Promise<{
        stopWhen: C
        returnWhenStopped: Y | PromiseLike<Y>
      }>((res, rej) => {
        setTimeout(() => {
          loop()
            .then(resolvedValue => {
              res(resolvedValue)
            })
            .catch(err => {
              rej(err)
            })
        }, effectivePollPeriod)
      })
    }
    const checkTimeout = (err?: Error) => {
      if (timeoutReached) {
        throw new Errors.TimeoutError(buildTimeoutMessage(), err)
      }
    }
    return safeCondition()
      .catch(err => {
        if (!ignoreError(err)) {
          return Promise.reject(err)
        }
        checkTimeout(err)
        return continueLoop()
      })
      .then(value => {
        if (value.stopWhen && value.returnWhenStopped) {
          return Promise.resolve(value)
        }
        checkTimeout()
        return continueLoop()
      })
  }
  return loop().then(value => {
    logger.debug(`timeout cancelled ${queryInfo()}`)

    clearTimeout(timer)
    return Promise.resolve(value.returnWhenStopped)
  })
}
