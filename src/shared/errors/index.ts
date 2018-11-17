import { QueryError, IErrorConstructor } from './query-error'
import { ErrorLike } from './error-like'
import { ArgumentError } from './argument-error'
import { TimeoutError } from './timeout-error'
import { SelectorError } from './selector-error'
import { BootstrapError } from './bootstrap-error'
import { ExecutionError } from './execution-error'
import { NoSuchElementError } from './no-such-element-error'
import { OutOfOptionsError } from './out-of-options-error'
import { UnexpectedTypeError } from './unexpected-type-error'
import { PageReloadedError } from './page-reloaded-error'

const allErrorsByName: {
  [key: string]: IErrorConstructor<QueryError>
} = {}

// tslint:disable-next-line:variable-name
export const ErrorsByName = [
  QueryError,
  ErrorLike,
  ArgumentError,
  TimeoutError,
  SelectorError,
  BootstrapError,
  ExecutionError,
  NoSuchElementError,
  OutOfOptionsError,
  UnexpectedTypeError,
  PageReloadedError,
].reduce((all, item) => {
  all[item.name] = item as IErrorConstructor<QueryError>
  return all
}, allErrorsByName)

export { QueryError } from './query-error'
export { ErrorLike } from './error-like'
export { ArgumentError } from './argument-error'
export { TimeoutError } from './timeout-error'
export { SelectorError } from './selector-error'
export { BootstrapError } from './bootstrap-error'
export { ExecutionError } from './execution-error'
export { NoSuchElementError } from './no-such-element-error'
export { OutOfOptionsError } from './out-of-options-error'
export { UnexpectedTypeError } from './unexpected-type-error'
export { PageReloadedError } from './page-reloaded-error'
