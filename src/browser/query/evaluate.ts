import { ArgumentError } from '../../shared/errors'

const isFunctionRegEx = /^function\s/
const isLambdaRegEx = /^\(.*\)\s*\=\>/

const evaluateBasic = (script: string | ((...args: any[]) => any), ...args: any[]): any => {
  if (typeof script === 'string') {
    const trimmed = script.trim()
    const isFunction = [isFunctionRegEx, isLambdaRegEx].some(regex => regex.test(trimmed))
    const template = isFunction ? `return ${script}` : script
    const funcResult = new Function(`"use strict"; ${template};`)(...args)
    // in cases when passed script is a function
    if (isFunction && typeof funcResult === 'function') {
      return funcResult(...args)
    }
    return funcResult
  } else if (typeof script === 'function') {
    return script(...args)
  } else {
    throw new ArgumentError('The script argument is mandatory')
  }
}

export const evaluate = (
  script: string | ((...args: any[]) => any),
  ...args: any[]
): Promise<any> => {
  const result = evaluateBasic(script, ...args)
  if (result && typeof result.then === 'function') {
    return result
  }
  return Promise.resolve(result)
}
