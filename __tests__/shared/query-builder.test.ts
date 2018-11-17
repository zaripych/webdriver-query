import { QueryBuilder, SubQueryInfo } from '../../src/shared/query'
import { ArgumentError } from '../../src/shared/errors'

describe('QueryBuilder', () => {
  let instance: QueryBuilder

  beforeEach(() => {
    instance = new QueryBuilder()
  })

  it('can be created', () => {
    expect(instance).toBeInstanceOf(QueryBuilder)
  })

  it('throws when invalid parameter', () => {
    // @ts-ignore
    expect(() => new QueryBuilder({})).toThrow(ArgumentError)
  })

  it('can be created alternatively', () => {
    expect(new QueryBuilder([])).toBeInstanceOf(QueryBuilder)
    const query2 = new QueryBuilder(
      new QueryBuilder([
        {
          script: 'doSomething()',
        },
      ])
    )
    expect(query2).toBeInstanceOf(QueryBuilder)
    expect(query2.buildDescription()).toBe('doSomething()')
  })

  it('append() succeeds', () => {
    instance.appendScript('someCustomScript({})')
  })

  it('numberOfCalls gives you correct number', () => {
    instance = instance.appendScript('someCustomScript({})')
    instance = instance.appendCall('call', null)
    expect(instance.numberOfCalls).toBe(2)
  })

  it('appendCall() with empty args succeeds', () => {
    instance.appendCall('query')
  })

  it('appendCall() with one arg succeeds', () => {
    instance.appendCall('query', 'something')
  })

  it("appendCall('query') builds", () => {
    expect(instance.appendCall('query').build()).toEqual({
      script: 'query()',
      arguments: [],
    })
  })

  it("appendCall('query', 'something') builds", () => {
    expect(instance.appendCall('query', 'something').build()).toEqual({
      script: 'query(_args[0])',
      arguments: ['something'],
    })
  })

  it("appendCall('query') builds description", () => {
    const q = instance.appendCall('query')
    expect(q.buildDescription()).toEqual('query()')
    expect(q.build()).toEqual({
      script: 'query()',
      arguments: [],
    })
  })

  it("appendCall('query', 'something') builds description", () => {
    const q = instance.appendCall('query', 'something')
    expect(q.buildDescription()).toEqual(`query("something")`)
    expect(q.build()).toEqual({
      script: `query(_args[0])`,
      arguments: ['something'],
    })
  })

  it('appendCall(/regex/i) builds description', () => {
    const q = instance.appendCall('query', /regex/i)
    expect(q.buildDescription()).toEqual(`query(/regex/i)`)
    expect(q.build()).toEqual({
      script: `query(/regex/i)`,
      arguments: [],
    })
  })

  it('appendCall(function () {}) builds description', () => {
    const scriptFunction = function doAlert() {
      alert(100)
    }
    const q = instance.appendCall('call', scriptFunction)
    const script = scriptFunction.toString()
    expect(q.buildDescription()).toEqual(`call(${script})`)
    expect(q.build()).toEqual({
      script: `call(${script})`,
      arguments: [],
    })
  })

  it('appendScript(...) builds description', () => {
    const q = instance.appendScript('script(...)')
    expect(q.buildDescription()).toEqual(`script(...)`)
    expect(q.build()).toEqual({
      script: `script(...)`,
      arguments: [],
    })
  })

  it('appendCall({ query... }) builds', () => {
    const q = instance.appendCall('waitFor', {
      query: new QueryBuilder()
        .prependConstructor('constructor')
        .appendCall('whileAgeBetween', 2, 25),
    })
    expect(q.buildDescription()).toEqual(`waitFor(whileAgeBetween(2, 25))`)
    expect(q.build()).toEqual({
      script: `waitFor(constructor().whileAgeBetween(_args[0], _args[1]))`,
      arguments: [2, 25],
    })
  })

  it('appendCall(q => q.query...) builds', () => {
    const q = instance.appendCall(
      'waitFor',
      new SubQueryInfo(
        {
          query: new QueryBuilder()
            .prependConstructor('constructor')
            .appendCall('findElement', 'root'),
        },
        parent => ({
          query: parent.query.appendCall('findElement', 'child'),
        })
      )
    )
    expect(q.buildDescription()).toEqual(`waitFor(q => q.findElement(\"child\"))`)
    expect(q.build()).toEqual({
      script: `waitFor(q => q.findElement(_args[0]))`,
      arguments: ['child'],
    })
  })

  it('appendCall(.doSomething(q => q.query...)) builds', () => {
    const parent = new QueryBuilder()
      .prependConstructor('constructor')
      .appendCall('findElement', 'root')
    const q = parent.appendCall(
      'waitFor',
      new SubQueryInfo(
        {
          query: parent,
        },
        p => ({
          query: p.query.appendCall('findElement', 'child'),
        })
      )
    )
    expect(q.buildDescription()).toEqual(
      `constructor().findElement(\"root\").waitFor(q => q.findElement(\"child\"))`
    )
    expect(q.build()).toEqual({
      script: `constructor().findElement(_args[0]).waitFor(q => q.findElement(_args[1]))`,
      arguments: ['root', 'child'],
    })
  })

  it('appendCall(.doSomething(q => {})) builds', () => {
    const parent = new QueryBuilder()
      .prependConstructor('constructor')
      .appendCall('findElement', 'root')
    const q = parent.appendCall(
      'waitFor',
      new SubQueryInfo(
        {
          query: parent,
        },
        p => ({
          propertyOne: {
            query: p.query.appendCall('findElement', 'child-1'),
          },
          propertyTwo: {
            query: p.query.appendCall('findElement', 'child-2'),
          },
        })
      )
    )
    expect(q.buildDescription()).toEqual(
      `constructor().findElement(\"root\").waitFor(q => ({
  "propertyOne": q.findElement("child-1"),
  "propertyTwo": q.findElement("child-2")
}))`
    )
    expect(q.build()).toEqual({
      script: `constructor().findElement(_args[0]).waitFor(q => ({
  "propertyOne": q.findElement(_args[1]),
  "propertyTwo": q.findElement(_args[2])
}))`,
      arguments: ['root', 'child-1', 'child-2'],
    })
  })
})
