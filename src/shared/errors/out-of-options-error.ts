import { QueryError } from './query-error'

export class OutOfOptionsError extends QueryError {}

OutOfOptionsError.prototype.name = 'OutOfOptionsError'
