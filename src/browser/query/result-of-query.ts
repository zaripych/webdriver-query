import { ElementQuery } from './element-query'
import { StringQuery } from './string-query'
import { NullableStringQuery } from './nullable-string-query'
import { NumberQuery } from './number-query'
import { AnyResultType } from '../../shared/query'
import { ObjectQuery } from './object-query'
import { AnyQuery } from './any-query'
import { IBaseQuery } from './base-query'
import { ConditionQuery } from './condition-query'
import { ArrayQuery } from './array-query'

type YES = 'Yep'
type NO = 'Nope'

type OnlyExtendsBase<R, Test, TYep = YES, TNope = NO> = Exclude<R, Test> extends never
  ? (R extends Test ? TYep : never)
  : TNope

// check if R only extends Test, return TYes if yes, TNope otherwise
type EqualTypes<R, Test, TYep = YES, TNope = NO> = OnlyExtendsBase<R, Test> extends TYep
  ? OnlyExtendsBase<Test, R>
  : TNope

type QueryForResultType1<R> = EqualTypes<R, boolean> extends YES
  ? ConditionQuery
  : EqualTypes<R, string | null> extends YES
  ? NullableStringQuery
  : EqualTypes<R, string> extends YES
  ? StringQuery
  : EqualTypes<R, number> extends YES
  ? NumberQuery
  : EqualTypes<R, HTMLElement> extends YES
  ? ElementQuery
  : (R extends object // <-- since ObjectQuery<R extends object>
      ? (Exclude<R, HTMLElement> extends never // <-- since these extends object
          ? AnyQuery
          : (EqualTypes<R, object> extends YES ? ObjectQuery<R> : never))
      : AnyQuery)

type QueryForResultType2<R> = Extract<R, string> extends never // conflicts with Array
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType1<Rr>>
    : QueryForResultType1<R>
  : QueryForResultType1<R>

type QueryForResultType3<R> = Extract<R, string> extends never
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType2<Rr>>
    : QueryForResultType1<R>
  : QueryForResultType1<R>

type QueryForResultType4<R> = Extract<R, string> extends never
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType3<Rr>>
    : QueryForResultType1<R>
  : QueryForResultType1<R>

type QueryForResultType5<R> = Extract<R, string> extends never
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType4<Rr>>
    : QueryForResultType1<R>
  : QueryForResultType1<R>

// determine query given result type R
export type QueryForResultType<R> = QueryForResultType5<R>

if (!true) {
  function typeAssert<T>(value: T) {
    return value
  }

  typeAssert<EqualTypes<null | undefined, null | undefined>>('Yep')
  typeAssert<EqualTypes<YES, YES>>('Yep')
  typeAssert<EqualTypes<null, null>>('Yep')
  typeAssert<EqualTypes<null, undefined>>('Nope')

  typeAssert<EqualTypes<number, number>>('Yep')
  typeAssert<EqualTypes<string, string>>('Yep')
  typeAssert<EqualTypes<string | number, string | number>>('Yep')
  typeAssert<EqualTypes<string | null, string | null>>('Yep')
  typeAssert<EqualTypes<HTMLElement, HTMLElement>>('Yep')
  typeAssert<EqualTypes<HTMLElement, HTMLElement>>('Yep')

  typeAssert<EqualTypes<string, string | null>>('Nope')
  typeAssert<EqualTypes<string | null, string>>('Nope')
  typeAssert<EqualTypes<any, string>>('Nope')
  typeAssert<EqualTypes<string, any>>('Nope')
  typeAssert<EqualTypes<HTMLElement, {}>>('Nope')
  typeAssert<EqualTypes<{}, HTMLElement>>('Nope')

  typeAssert<EqualTypes<QueryForResultType<string>, StringQuery>>('Yep')
  typeAssert<EqualTypes<QueryForResultType<number>, NumberQuery>>('Yep')
  typeAssert<EqualTypes<QueryForResultType<string | null>, NullableStringQuery>>('Yep')
  typeAssert<EqualTypes<QueryForResultType<{}>, ObjectQuery<{}>>>('Yep')
  typeAssert<EqualTypes<QueryForResultType<HTMLElement>, ElementQuery>>('Yep')
  typeAssert<EqualTypes<QueryForResultType<HTMLElement[]>, ArrayQuery<HTMLElement, ElementQuery>>>(
    'Yep'
  )
  typeAssert<
    EqualTypes<
      QueryForResultType<HTMLElement[][]>,
      ArrayQuery<HTMLElement[], ArrayQuery<HTMLElement, ElementQuery>>
    >
  >('Yep')
}

export type ResultOfQuery<T extends IBaseQuery<R>, R = any> = T extends AnyQuery
  ? AnyResultType
  : T extends IBaseQuery<infer Rr>
  ? Rr
  : never
