type AnyFunc = (...args: any[]) => any;

export type OnFulfilled<T, TResult> =
  | ((value: T) => TResult | PromiseLike<TResult>)
  | undefined
  | null;

export type OnRejected<TResult> =
  | ((reason: any) => TResult | PromiseLike<TResult>)
  | undefined
  | null;

export interface IPromise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: OnFulfilled<T, TResult1>,
    onrejected?: OnRejected<TResult2>
  ): Promise<TResult1 | TResult2> | PromiseLike<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?: OnRejected<TResult>
  ): IPromise<T | TResult>;
}

export interface IDriver {
  executeAsyncScript<T>(script: string | AnyFunc, ...args: any[]): IPromise<T>;
  executeScript<T>(script: string | AnyFunc, ...args: any[]): IPromise<T>;
  get(url: string): IPromise<void>;
}
