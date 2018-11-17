import { QueryError } from './query-error';

export class UnexpectedTypeError extends QueryError {}

UnexpectedTypeError.prototype.name = 'UnexpectedTypeError';
