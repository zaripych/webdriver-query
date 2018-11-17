import * as Errors from '../../shared/errors'
import { QueryBuilder } from '../../shared/query'

export function perform<T>(executor: () => Promise<T>, query: QueryBuilder) {
  const promise = (): Promise<T> => {
    try {
      return executor()
    } catch (exc) {
      return Promise.reject(exc)
    }
  }
  return promise().catch(err => {
    if (!(err instanceof Errors.QueryError)) {
      const description = query.buildDescription(1)
      throw new Errors.ExecutionError(`In a sub-query: ${description}`, err)
    }
    return Promise.reject(err)
  })
}
