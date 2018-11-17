import { QueryError } from './query-error';

export class SelectorError extends QueryError {}

SelectorError.prototype.name = 'SelectorError';
