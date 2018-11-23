import {
  describeBrowserTests,
  IBuildResult,
} from '../utils/browser-tests-config'
import { Query } from '../../src/node/query'
import { TimeoutError } from '../../src/shared/errors'
import * as selenium from 'selenium-webdriver'

describe('Query.wait', () => {
  describeBrowserTests(testDataBuilder => {
    let baseQuery: Query
    let buildResult: IBuildResult
    beforeAll(async () => {
      buildResult = await testDataBuilder({})
      baseQuery = buildResult.query
    })

    beforeEach(async () => {
      await buildResult.refresh()
    })

    const testedQuery = () => {
      return baseQuery.findElement('#timerTarget').getText()
    }

    it('should resolve', async () => {
      const result = await testedQuery()

      expect(result).toEqual('0')
    })

    describe("given an element query that doesn't exist immediately but appears within timeout", async () => {
      const waitQuery = () => {
        return baseQuery
          .findElement('#simulatedSpinner')
          .retry()
          .getText()
      }

      it('should resolve', async () => {
        const result = await waitQuery()

        expect(result).toEqual('Spinning...')
      })
    })

    describe(
      "given an element query that doesn't " +
        "exist immediately and doesn't appears within timeout",
      async () => {
        const waitQuery = () => {
          return baseQuery
            .findElement('#simulatedSpinner')
            .retry({ timeout: 1000 })
            .getText()
        }

        it('should reject', async () => {
          try {
            await waitQuery()
            fail('Supposed to throw!')
          } catch (err) {
            expect(err).toBeInstanceOf(TimeoutError)
          }
        })
      }
    )

    describe('given an element query that appears and then disappears within timeout', async () => {
      const waitQuery = () => {
        return baseQuery
          .findElement('#simulatedSpinner')
          .waitUntil(q => q.exists())
          .waitUntil(q => q.exists().not())
          .exists()
      }

      it('should resolve', async () => {
        const result = await waitQuery()

        expect(result).toEqual(false)
      })
    })

    describe("given an element query that doesn't appear within timeout", async () => {
      const waitQuery = () => {
        return baseQuery
          .findElement('#simulatedSpinner')
          .waitUntil(q => q.exists(), { timeout: 1000 })
          .waitUntil(q => q.exists().not())
          .exists()
      }

      it('should reject', async () => {
        try {
          await waitQuery()
          fail('Supposed to throw!')
        } catch (err) {
          expect(err).toBeInstanceOf(TimeoutError)
        }
      })
    })

    describe("given an element query where second wait doesn't resolve within timeout", async () => {
      const waitQuery = () => {
        return baseQuery
          .findElement('#simulatedSpinner')
          .waitUntil(/* istanbul ignore next */ q => q.exists())
          .waitUntil(/* istanbul ignore next */ q => q.exists().not(), {
            timeout: 500,
          })
          .exists()
      }

      it('should reject', async () => {
        try {
          await waitQuery()
          fail('Supposed to throw!')
        } catch (err) {
          expect(err).toBeInstanceOf(TimeoutError)
        }
      })
    })

    describe('given an element query that appears and then disappears within timeout', async () => {
      const waitQuery = () => {
        return baseQuery
          .findElement('#simulatedSpinner')
          .exists()
          .retry()
          .not()
          .retry()
      }

      it('should resolve', async () => {
        const result = await waitQuery()

        expect(result).toEqual(true)
      })
    })

    describe('given a query that resolves within timeout', async () => {
      // the default timeout is 5s
      const waitQuery = () => {
        return baseQuery
          .waitUntil(q =>
            q
              .findElement('#timerTarget')
              .getText()
              .equals('0')
              .not()
          )
          .findElement('#timerTarget')
          .getText()
      }

      it('should resolve', async () => {
        const result = await waitQuery()

        expect(result).not.toEqual('0')
      })
    })

    describe("given a query that doesn't resolve within timeout", async () => {
      // the default timeout is 5s
      const waitQuery = () => {
        return baseQuery
          .waitUntil(
            q =>
              q
                .findElement('#timerTarget')
                .getText()
                .equals('0')
                .not(),
            { timeout: 500 }
          )
          .findElement('#timerTarget')
          .getText()
      }

      it('should reject', async () => {
        try {
          await waitQuery()
          fail('Expected to throw!')
        } catch (err) {
          expect(err).toBeInstanceOf(TimeoutError)
        }
      })
    })

    describe('given a query that doesnt resolve within timeout', async () => {
      const waitQuery = () => {
        return baseQuery
          .waitUntil(q =>
            q
              .findElement('#timerTarget')
              .getText()
              .toNumber()
              .greaterThan(15)
          )
          .findElement('#timerTarget')
          .getText()
      }

      it('should reject', async () => {
        try {
          await waitQuery()
          fail('Expected to throw!')
        } catch (err) {
          expect(err).toBeInstanceOf(TimeoutError)
        }
      })
    })
  })
})
