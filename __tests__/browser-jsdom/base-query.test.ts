import { BaseQuery } from '../../src/browser/query'
import { QueryBuilder, noOpLogger } from '../../src/shared'
import { DomLibrary } from '../../src/browser/dom-library'

jest.mock('../../src/browser/dom-library')

describe('BaseQuery', () => {
  it('can be constructed', () => {
    const query = new BaseQuery<number>({
      executor: () => {
        return Promise.resolve(0)
      },
      query: new QueryBuilder(),
      config: {
        waitTimeoutMilliseconds: 5000,
        minPollPeriodMilliseconds: 10,
        pollTimes: 10,
        shouldLog: false,
      },
      library: new DomLibrary(),
      logger: noOpLogger,
    })
    expect(query).toBeDefined()
  })

  it('when executor throws perform rejects', async () => {
    const query = new BaseQuery<number>({
      executor: () => {
        throw new Error('BaseQuery executor error')
      },
      query: new QueryBuilder(),
      config: {
        waitTimeoutMilliseconds: 5000,
        minPollPeriodMilliseconds: 10,
        pollTimes: 10,
        shouldLog: false,
      },
      library: new DomLibrary(),
      logger: noOpLogger,
    })
    await expect(query.perform()).rejects.toThrowError()
  })
})
