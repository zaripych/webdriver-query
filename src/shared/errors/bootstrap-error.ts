import { QueryError } from './query-error'

export class BootstrapError extends QueryError {}

BootstrapError.prototype.name = 'BootstrapError'
