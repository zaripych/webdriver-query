import { Query } from '../../src/browser/query'
import { TimeoutError } from '../../src/shared/errors'

describe('Query', () => {
  const query = new Query({})

  describe('given trigger to set in 100ms', () => {
    let timer: NodeJS.Timer
    let trigger: boolean
    beforeEach(() => {
      trigger = false
      clearTimeout(timer)
      timer = setTimeout(() => {
        trigger = true
      }, 100)
    })

    afterEach(() => {
      clearTimeout(timer)
    })

    describe('waitUntil given timeout > 100ms', () => {
      const waitOptions = {
        timeout: 200,
      }

      it('waits until it is set', async () => {
        const result = await query
          .waitUntil(q => q.execute(() => trigger).truthy(), waitOptions)
          .execute(() => trigger)
          .asBoolean()
          .perform()
        expect(result).toBe(true)
      })

      describe('given it is reset again', () => {
        const longerWaitOptions = {
          timeout: 300,
        }

        let secondTimer: NodeJS.Timer
        beforeEach(() => {
          clearTimeout(secondTimer)
          secondTimer = setTimeout(() => {
            trigger = false
          }, 200)
        })

        afterEach(() => {
          clearTimeout(secondTimer)
        })

        it('waits until it is set and then reset', async () => {
          const result = await query
            .waitUntil(q => q.execute(() => trigger).truthy(), waitOptions)
            .waitUntil(q => q.execute(() => !trigger).truthy(), longerWaitOptions)
            .execute(() => trigger)
            .asBoolean()
            .perform()
          expect(result).toBe(false)
        })
      })

      describe('given it is reset again, but too late', () => {
        const longerWaitOptions = {
          timeout: 300,
        }

        let secondTimer: NodeJS.Timer
        beforeEach(() => {
          clearTimeout(secondTimer)
          secondTimer = setTimeout(() => {
            trigger = false
          }, 1000)
        })

        afterEach(() => {
          clearTimeout(secondTimer)
        })

        it('waits until it is set and then reset', async () => {
          try {
            await query
              .waitUntil(q => q.execute(() => trigger).truthy(), waitOptions)
              .waitUntil(q => q.execute(() => !trigger).truthy(), longerWaitOptions)
              .execute(() => trigger)
              .asBoolean()
              .perform()
            fail('Expected to throw!')
          } catch (err) {
            expect(err).toBeInstanceOf(TimeoutError)
          }
        })
      })
    })

    describe('waitUntil given timeout < 100ms', () => {
      const waitOptions = {
        timeout: 50,
      }

      it('rejects because of timeout', async () => {
        try {
          expect(trigger).toBe(false)
          await query
            .waitUntil(q => q.execute(() => trigger).truthy(), waitOptions)
            .execute(() => trigger)
            .asBoolean()
            .perform()
          fail('Expected to fail!')
        } catch (err) {
          expect(err).toBeInstanceOf(TimeoutError)
        }
      })

      it('rejects because of timeout, with another wait in the chain', async () => {
        try {
          await query
            .waitUntil(q => q.execute(() => trigger).truthy(), waitOptions)
            .waitUntil(q => q.execute(() => !trigger).truthy(), waitOptions)
            .execute(() => trigger)
            .asBoolean()
            .perform()
          fail('Expected to fail!')
        } catch (err) {
          expect(err).toBeInstanceOf(TimeoutError)
        }
      })
    })

    describe('waitUntil given no timeout', () => {
      it('waits until it is set', async () => {
        const result = await query
          .waitUntil(q => q.execute(() => trigger).truthy())
          .execute(() => trigger)
          .asBoolean()
          .perform()
        expect(result).toBe(true)
      })
    })
  })
})
