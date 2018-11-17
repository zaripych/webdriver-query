import { Query, NumberQuery } from '../../src/browser/query'

describe('NumberQuery', () => {
  let queryDriver: Query
  beforeAll(() => {
    queryDriver = new Query()
  })

  describe('given rejecting parent query', () => {
    let query: NumberQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">Non-Empty String</div>`
      query = queryDriver.findElements('#%$&%^*(&)').count()
    })

    describe('.equals(any)', () => {
      it('should reject', async () => {
        return expect(query.equals(0).perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.greaterThan(any)', () => {
      it('should reject', async () => {
        return expect(query.greaterThan(0).perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.lessThan(any)', () => {
      it('should reject', async () => {
        return expect(query.greaterThan(0).perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.greaterThanOrEqual(any)', () => {
      it('should reject', async () => {
        return expect(query.greaterThanOrEqual(0).perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.lessThanOrEqual(any)', () => {
      it('should reject', async () => {
        return expect(query.lessThanOrEqual(0).perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.whenRejected(value)', () => {
      it('should resolve', async () => {
        const result = await query.whenRejected(42).perform()
        expect(result).toBe(42)
      })
    })
  })

  describe('given number 3 as resolved value', () => {
    let query: NumberQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">
                <div class="child" />
                <div class="child" />
                <div class="child" />
            </div>`
      query = queryDriver.findElements('.child').count()
    })

    describe('.equals(3)', () => {
      it('should resolve', async () => {
        const result = await query.equals(3).perform()
        expect(result).toBe(true)
      })
    })

    describe('.greaterThan(2)', () => {
      it('should resolve', async () => {
        const result = await query.greaterThan(2).perform()
        expect(result).toBe(true)
      })
    })

    describe('.greaterThan(3)', () => {
      it('should resolve', async () => {
        const result = await query.greaterThan(3).perform()
        expect(result).toBe(false)
      })
    })

    describe('.lessThan(4)', () => {
      it('should resolve', async () => {
        const result = await query.lessThan(4).perform()
        expect(result).toBe(true)
      })
    })

    describe('.lessThan(2)', () => {
      it('should resolve', async () => {
        const result = await query.lessThan(2).perform()
        expect(result).toBe(false)
      })
    })

    describe('.greaterThanOrEqual(3)', () => {
      it('should reject', async () => {
        const result = await query.greaterThanOrEqual(3).perform()
        expect(result).toBe(true)
      })
    })

    describe('.lessThanOrEqual(3)', () => {
      it('should reject', async () => {
        const result = await query.lessThanOrEqual(3).perform()
        expect(result).toBe(true)
      })
    })

    describe('.whenRejected(42)', () => {
      it('should resolve', async () => {
        const result = await query.whenRejected(42).perform()
        expect(result).toBe(3)
      })
    })
  })
})
