import { ArgumentError } from '../errors'

type QueryOrQueryMap =
  | IQuery
  | {
      [key: string]: IQuery
    }

type QueryBuildFunction = (query: IQuery) => QueryOrQueryMap

// tslint:disable:max-classes-per-file

export class SubQueryInfo {
  public readonly parent: IQuery
  public readonly buildFunction: QueryBuildFunction

  constructor(parent: IQuery, buildFunction: QueryBuildFunction) {
    this.parent = parent
    this.buildFunction = buildFunction
  }
}

export type QueryCallArgument = null | string | number | {} | ((...args: any[]) => any)

export interface IMethodCall {
  name: string
  arguments: QueryCallArgument[]
}

export interface IScriptCall {
  script: string
}

export type ChainElement = IMethodCall | IScriptCall

export interface IQueryCall {
  script: string
  arguments: QueryCallArgument[]
}

export interface IQuery {
  readonly query: QueryBuilder
}

export function hasQueryBuilder(arg: any): arg is IQuery {
  return arg && typeof arg === 'object' && 'query' in arg && arg.query instanceof QueryBuilder
}

export class QueryBuilder {
  public static readonly isInstalledExpression: string = `(!!window.sbq && !!window.sbq.Query)`
  public static readonly constructorName: string = 'new sbq.Query'

  private readonly calls: ChainElement[]

  constructor(arg: QueryBuilder | ChainElement[] = []) {
    if (arg instanceof QueryBuilder) {
      this.calls = arg.calls.concat([])
    } else if (Array.isArray(arg)) {
      this.calls = arg
    } else {
      throw new ArgumentError('Expected arg to be an array')
    }
  }

  public get numberOfCalls(): number {
    return this.calls.length
  }

  public prependConstructor<T extends string>(name: T, ...args: QueryCallArgument[]): QueryBuilder {
    const constructor: ChainElement[] = [
      {
        name,
        arguments: args,
      },
    ]
    const calls: ChainElement[] = constructor.concat(this.calls)
    return new QueryBuilder(calls)
  }

  public appendCall<T extends string>(name: T, ...args: QueryCallArgument[]): QueryBuilder {
    const calls = this.calls.concat([
      {
        name,
        arguments: args,
      },
    ])
    return new QueryBuilder(calls)
  }

  public appendScript(script: string): QueryBuilder {
    const calls = this.calls.concat([
      {
        script,
      },
    ])
    return new QueryBuilder(calls)
  }

  public build(argumentsArr: QueryCallArgument[] = [], skip: number = 0): IQueryCall {
    const allArguments: QueryCallArgument[] = argumentsArr
    const allCalls = this.calls.slice(skip)
    return {
      script: allCalls.reduce((result, entry) => {
        const previous = result ? result + '.' : result
        if (this.isCall(entry)) {
          if (entry.arguments.length > 0) {
            const entryArguments = entry.arguments.map(arg => {
              if (hasQueryBuilder(arg)) {
                return arg.query.build(allArguments).script
              } else if (arg instanceof RegExp) {
                return this.regExpToRegExpExpression(arg)
              } else if (arg instanceof SubQueryInfo) {
                return this.subQueryScriptWithArguments(arg, allArguments)
              } else if (typeof arg === 'function') {
                return this.convertFunctionArg(arg)
              } else {
                allArguments.push(arg)
                return `_args[${allArguments.length - 1}]`
              }
            })
            return previous + `${entry.name}(${entryArguments.join(', ')})`
          } else {
            return previous + `${entry.name}()`
          }
        } else {
          return previous + entry.script
        }
      }, ''),
      arguments: allArguments,
    }
  }

  public buildDescription(skip: number = 0): string {
    const allCalls = this.calls.slice(skip)
    return allCalls.reduce((result, entry) => {
      const previous = result ? result + '.' : result
      if (this.isCall(entry)) {
        if (entry.arguments.length > 0) {
          const entryArguments = entry.arguments.map(arg => {
            return this.description(arg)
          })
          return previous + `${entry.name}(${entryArguments.join(', ')})`
        } else {
          return previous + `${entry.name}()`
        }
      } else {
        return previous + entry.script
      }
    }, '')
  }

  private subQueryDescription(subQuery: SubQueryInfo) {
    const result = subQuery.buildFunction(subQuery.parent)
    return (
      'q => ' +
      this.buildSubQuery(
        'q',
        result,
        [],
        (query, _qargs, skip) => query.buildDescription(skip),
        subQuery.parent.query.numberOfCalls
      )
    )
  }

  private subQueryScriptWithArguments(subQuery: SubQueryInfo, args: QueryCallArgument[]) {
    const result = subQuery.buildFunction(subQuery.parent)
    return (
      'q => ' +
      this.buildSubQuery(
        'q',
        result,
        args,
        (query, qargs, skip) => query.build(qargs, skip).script,
        subQuery.parent.query.numberOfCalls
      )
    )
  }

  private buildSubQuery(
    parentQueryVar: string,
    subQuery: QueryOrQueryMap,
    args: QueryCallArgument[],
    buildFunction: (query: QueryBuilder, args: QueryCallArgument[], skip: number) => string,
    skip: number
  ) {
    if (hasQueryBuilder(subQuery)) {
      return `${parentQueryVar}.${buildFunction(subQuery.query, args, skip)}`
    } else if (Array.isArray(subQuery)) {
      const result = subQuery as IQuery[]

      const lines: string[] = []
      result.reduce((acc, val) => {
        acc.push('  ' + this.buildSubQuery(parentQueryVar, val, args, buildFunction, skip))
        return acc
      }, lines)

      return `([
${lines.join(',\n')}
])`
    } else if (typeof subQuery === 'object') {
      const result = subQuery as {
        [key: string]: IQuery
      }

      const lines: string[] = []
      Object.keys(result).reduce((acc, key) => {
        acc.push(
          '  ' +
            JSON.stringify(key) +
            ': ' +
            this.buildSubQuery(parentQueryVar, result[key], args, buildFunction, skip)
        )
        return acc
      }, lines)

      return `({
${lines.join(',\n')}
})`
    } else {
      throw new Error('Invalid argument')
    }
  }

  private convertFunctionArg(argument: (...args: any[]) => any) {
    // remove coverage counters
    const result = argument.toString()
    return result.replace(/(\/\* istanbul ignore next \*\/)?(cov_[^;]*;)+/i, '')
  }

  private isCall(entry: ChainElement): entry is IMethodCall {
    return 'name' in entry
  }

  private regExpToRegExpExpression(regExp: RegExp) {
    return `/${regExp.source}/${regExp.flags}`
  }

  private description(value: QueryCallArgument): string {
    if (hasQueryBuilder(value)) {
      return value.query.buildDescription(1)
    } else if (value instanceof SubQueryInfo) {
      return this.subQueryDescription(value)
    } else if (value instanceof RegExp) {
      return this.regExpToRegExpExpression(value)
    } else if (typeof value === 'function') {
      return this.convertFunctionArg(value)
    }
    return JSON.stringify(value)
  }
}
