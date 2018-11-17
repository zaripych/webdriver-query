import { QueryError } from './query-error';

export class TimeoutError extends QueryError {}

TimeoutError.prototype.name = 'TimeoutError';
