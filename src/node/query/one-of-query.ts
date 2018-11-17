import { ElementQuery } from './element-query'
import { StringQuery } from './string-query'
import { NumberQuery } from './number-query'
import { NullableStringQuery } from './nullable-string-query'
import { ObjectQuery } from './object-query'
import { AnyQuery } from './any-query'

export type OneOfQueries =
  | ElementQuery
  | StringQuery
  | NumberQuery
  | NullableStringQuery
  | ObjectQuery
  | AnyQuery
