import { QueryError } from './query-error'

export class ArgumentError extends QueryError {}

ArgumentError.prototype.name = 'ArgumentError'
