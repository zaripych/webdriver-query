import { QueryError } from './query-error'

export class PageReloadedError extends QueryError {}

PageReloadedError.prototype.name = 'PageReloadedError'
