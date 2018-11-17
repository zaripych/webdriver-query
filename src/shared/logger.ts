export type LoggingEntry = string | any[]

interface ILogger {
  debug: typeof console.debug
  error: typeof console.error
  info: typeof console.info
}

export interface IAsyncLogger {
  readonly name: string
  debug(message: string, ...args: any[]): IAsyncLogger
  debug(callback: () => LoggingEntry): IAsyncLogger
  error(message: string, ...args: any[]): IAsyncLogger
  error(callback: () => LoggingEntry): IAsyncLogger
  info(message: string, ...args: any[]): IAsyncLogger
  info(callback: () => LoggingEntry): IAsyncLogger
}

const noOp = () => {
  return noOpLogger
}

export const noOpLogger: IAsyncLogger = Object.freeze({
  name: 'noOp',
  debug: noOp,
  error: noOp,
  info: noOp,
})

export type LogType = string | 'none' | 'debug' | 'info' | 'error'

export interface ITracker {
  id: number
  type: LogType
  elapsed?: () => number
}

const formatId = (id: number) => {
  const result = id.toString()
  if (result.length < 4) {
    return '0'.repeat(4 - result.length) + result
  } else {
    return result
  }
}

const defaultFormat = (tracker: ITracker, entry: LoggingEntry) => {
  const elapsed = tracker.elapsed ? ` (+${tracker.elapsed()}ms)` : ''
  if (Array.isArray(entry)) {
    const [first, ...rest] = entry
    return [`[${formatId(tracker.id)}] ${first}${elapsed}`, ...rest]
  } else {
    return `[${formatId(tracker.id)}] ${entry}${elapsed}`
  }
}

const log = (
  tracker: ITracker,
  method: typeof console.debug,
  format: typeof defaultFormat,
  ...arg: any[]
) => {
  const entry = arg.length === 1 && typeof arg[0] === 'function' ? arg[0]() : arg
  const formatted = format(tracker, entry)
  if (Array.isArray(formatted)) {
    method(...formatted)
  } else {
    method(formatted)
  }
}

const anyLoggerFactory = (
  name: string,
  methods: () => ILogger,
  /* istanbul ignore next */
  format = defaultFormat
) => {
  let globalId = 0

  const logWithTracker = (
    type: LogType,
    method: ILogger['debug'],
    fixedId?: number,
    elapsed?: () => number,
    ...args: any[]
  ) => {
    const id = fixedId || (globalId += 1)
    log({ id, elapsed, type }, method, format, ...args)
    return createAnyLogger(id, elapsedGenerator())
  }

  const createAnyLogger = (fixedId?: number, elapsed?: () => number): IAsyncLogger =>
    Object.freeze({
      name,
      debug: (...args: any[]) => {
        return logWithTracker('debug', methods().debug, fixedId, elapsed, ...args)
      },
      error: (...args: any[]) => {
        return logWithTracker('error', methods().error, fixedId, elapsed, ...args)
      },
      info: (...args: any[]) => {
        return logWithTracker('info', methods().info, fixedId, elapsed, ...args)
      },
    })

  return createAnyLogger
}

// tslint:disable:no-console

export const consoleLoggerFactory = (format = defaultFormat) =>
  anyLoggerFactory(
    'console',
    () => ({
      debug: console.debug.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
    }),
    format
  )

export const consoleLogger: () => IAsyncLogger = consoleLoggerFactory()

export const timestamp = () => {
  /* istanbul ignore next */
  return window.performance &&
    window.performance.now &&
    window.performance.timing &&
    window.performance.timing.navigationStart
    ? window.performance.now() + window.performance.timing.navigationStart
    : Date.now()
}

export const elapsedGenerator = () => {
  const start = timestamp()

  return () => {
    return timestamp() - start
  }
}
