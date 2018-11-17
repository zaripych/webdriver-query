import * as selenium from 'selenium-webdriver';
import { ElementQuery } from './element-query';
import { StringQuery } from './string-query';
import { NullableStringQuery } from './nullable-string-query';
import { NumberQuery } from './number-query';
import { ConditionQuery } from './condition-query';
import { AnyResultType, IDriver, IPromise } from '../../shared/query';
import { ObjectQuery } from './object-query';
import { AnyQuery } from './any-query';
import { ArrayQuery } from './array-query';
import { IBaseQuery } from './base-query';

type YES = 'Yep';
type NO = 'Nope';

type OnlyExtendsBase<R, Test, TYep = YES, TNope = NO> = Exclude<
  R,
  Test
> extends never
  ? (R extends Test ? TYep : never)
  : TNope;

// check if R only extends Test, return TYes if yes, TNope otherwise
type EqualTypes<R, Test, TYep = YES, TNope = NO> = OnlyExtendsBase<
  R,
  Test
> extends TYep
  ? OnlyExtendsBase<Test, R>
  : TNope;

interface IQueryConfig<
  TDriver extends IDriver = selenium.WebDriver,
  TElement = selenium.WebElement,
  TElementPromise extends IPromise<any> = selenium.WebElementPromise
> {
  driver: TDriver;
  element: TElement;
  elementPromise: TElementPromise;
}

type QueryForResultType1<R, TConf extends IQueryConfig> = EqualTypes<
  R,
  boolean
> extends YES
  ? ConditionQuery
  : EqualTypes<R, string | null> extends YES
    ? NullableStringQuery
    : EqualTypes<R, string> extends YES
      ? StringQuery
      : EqualTypes<R, number> extends YES
        ? NumberQuery
        : EqualTypes<R, TConf['element']> extends YES
          ? ElementQuery<TConf['element'], TConf['elementPromise']>
          : EqualTypes<R, TConf['elementPromise']> extends YES
            ? ElementQuery<TConf['element'], TConf['elementPromise']>
            : (R extends object // <-- since ObjectQuery<R extends object>
                ? (Exclude<
                    R,
                    TConf['element'] | TConf['elementPromise']
                  > extends never // <-- since these extends object
                    ? AnyQuery
                    : (EqualTypes<R, object> extends YES
                        ? ObjectQuery<R>
                        : never))
                : AnyQuery);

type QueryForResultType2<R, TConf extends IQueryConfig> = Extract<
  R,
  string
> extends never // conflicts with Array
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType1<Rr, TConf>>
    : QueryForResultType1<R, TConf>
  : QueryForResultType1<R, TConf>;

type QueryForResultType3<R, TConf extends IQueryConfig> = Extract<
  R,
  string
> extends never
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType2<Rr, TConf>>
    : QueryForResultType1<R, TConf>
  : QueryForResultType1<R, TConf>;

type QueryForResultType4<R, TConf extends IQueryConfig> = Extract<
  R,
  string
> extends never
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType3<Rr, TConf>>
    : QueryForResultType1<R, TConf>
  : QueryForResultType1<R, TConf>;

type QueryForResultType5<R, TConf extends IQueryConfig> = Extract<
  R,
  string
> extends never
  ? R extends Array<infer Rr>
    ? ArrayQuery<Rr, QueryForResultType4<Rr, TConf>>
    : QueryForResultType1<R, TConf>
  : QueryForResultType1<R, TConf>;

// determine query given result type R
export type QueryForResultType<
  R,
  TConf extends IQueryConfig = IQueryConfig
> = QueryForResultType5<R, TConf>;

export type ResultOfQuery<T extends IBaseQuery<R>, R = any> = T extends AnyQuery
  ? AnyResultType
  : T extends IBaseQuery<infer Rr> ? Rr : never;
