import { QueryError } from './query-error';

export class ExecutionError extends QueryError {}

ExecutionError.prototype.name = 'ExecutionError';
