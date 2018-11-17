/**
 * These just throw an exception to help diagnose stack differences
 */

export interface IErrorConstructor<T extends Error> {
  new (...args: any[]): T
}

export function throwError<T extends Error>(excType: IErrorConstructor<T>, ...args: any[]) {
  throw new excType(...args)
}

export function throwErrorLater<T extends Error>(excType: IErrorConstructor<T>, ...args: any[]) {
  throwError(excType, ...args)
}
