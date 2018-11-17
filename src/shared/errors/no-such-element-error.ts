import { QueryError } from './query-error'

export class NoSuchElementError extends QueryError {}

NoSuchElementError.prototype.name = 'NoSuchElementError'
