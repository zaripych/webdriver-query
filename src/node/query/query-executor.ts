import {
  QueryError,
  ExecutionError,
  ErrorLike,
  ArgumentError,
  BootstrapError,
} from '../../shared/errors'

import { QueryBuilder, IConfig, IDriver, IAsyncLogger, noOpLogger } from '../../shared'
import { locatorToSelector } from './locator-to-selector'
import { IErrorLike } from '../../shared/errors/error-like'
import { PageReloadedError } from '../../shared/errors/page-reloaded-error'

interface IScriptResult<T> {
  value?: T
  type: string
  error?: IErrorLike
}

const restoreValue = <T>(result: IScriptResult<T>): T | null => {
  // weird but sometimes we get result.value === null
  // even though the value was an empty string on browser side (Edge)
  if (result.type === 'string' && !result.value) {
    return ('' as any) as T
  }
  return result.value === undefined ? null : result.value
}

export class QueryExecutor {
  public static readonly pageReloadErrors: RegExp[] = [
    /document unloaded while waiting for result/,
    /Callback was not called before the unload event/,
  ]
  public readonly driver: IDriver
  public readonly config?: Partial<IConfig>

  private readonly logger: IAsyncLogger
  private readonly precondition: () => Promise<void>
  private readonly install?: () => Promise<void>

  private get scriptDriver() {
    return this.driver as IDriver
  }

  constructor(
    driver: IDriver,
    precondition: () => Promise<void>,
    config?: Partial<IConfig>,
    logger?: IAsyncLogger,
    install?: () => Promise<void>
  ) {
    if (!driver) {
      throw new ArgumentError(
        '`driver` is mandatory parameter and should refer to a valid WebDriver'
      )
    }
    if (typeof driver.executeAsyncScript !== 'function') {
      throw new ArgumentError(
        '`driver` is mandatory parameter and should refer to a valid WebDriver'
      )
    }
    this.driver = driver
    this.precondition = precondition
    this.config = config
    this.logger = logger || noOpLogger
    this.install = install
  }

  public locatorToSelector(locator: any): string {
    return locatorToSelector(locator)
  }

  public perform<T>(queryBuilder: QueryBuilder): Promise<T> {
    if (!queryBuilder || !(queryBuilder instanceof QueryBuilder)) {
      throw new Error('Expected query builder to be passed')
    }

    const driver = this.scriptDriver
    const config = this.config

    const query = queryBuilder.prependConstructor(
      QueryBuilder.constructorName,
      ...(config ? [config] : [])
    )

    const call = query.build()

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
      ${call.script}
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
    }`

    const log = this.logger.debug(() => ['executing script: ', call.script, call.arguments])

    const executeScriptNoRetry = () =>
      this.precondition()
        .then(() =>
          driver.executeAsyncScript<IScriptResult<T>>(script, ...call.arguments).then(value => {
            if (value.error) {
              if (ErrorLike.isErrorLike(value.error)) {
                throw ErrorLike.createError(value.error)
              } else {
                throw new Error(value.error)
              }
            }
            log.debug(() => ['finished with value', value])

            // this check below is to ensure same behavior as WebDriver
            return restoreValue(value) as T
          })
        )
        .catch((err: Error) => {
          log.debug(() => ['finished with error', err.name, err.message])
          if (!(err instanceof QueryError)) {
            if (err.name === 'JavascriptError') {
              if (this.isPageReloadError(err)) {
                return Promise.reject(
                  new PageReloadedError(
                    'The page was reloaded due to a side effect caused by the query itself or auto-refresh. ' +
                      'Use .expectPageReload() function to catch and ignore this error, or ensure the page is not reloaded anymore. This is analogue of StaleElementError from Selenium. ',
                    err,
                    query
                  )
                )
              }
              return Promise.reject(
                new ExecutionError(
                  `An internal JavaScript error occurred, it is advised to check any custom JavaScript used in .execute sub-queries for typos/mistakes`,
                  err,
                  query,
                  `\n\n  in script:\n${script}\n`
                )
              )
            }
            return Promise.reject(new ExecutionError(`An error occurred`, err, query))
          } else {
            return Promise.reject(err)
          }
        })

    return executeScriptNoRetry().catch(err => {
      if (this.install && err instanceof BootstrapError) {
        return this.install().then(() => executeScriptNoRetry())
      }
      return Promise.reject(err)
    })
  }

  public waitForUnload(timeoutMs: number) {
    return this.driver
      .executeAsyncScript<void>(
        `setTimeout(function onTimeout(cb) {
  cb();
}, arguments[0], arguments[1])`,
        timeoutMs
      )
      .catch(err => {
        if (this.isPageReloadError(err)) {
          return Promise.resolve()
        }
        return Promise.reject(err)
      })
  }

  private isPageReloadError(error: Error): boolean {
    return QueryExecutor.pageReloadErrors.some(pattern => pattern.test(error.message))
  }
}
