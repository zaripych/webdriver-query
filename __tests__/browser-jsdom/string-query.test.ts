import { Query, StringQuery } from '../../src/browser/query'
import { ArgumentError } from '../../src/shared/errors'

describe('StringQuery', () => {
  let queryDriver: Query
  beforeAll(() => {
    queryDriver = new Query()
  })

  describe('given rejecting parent query', () => {
    let query: StringQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">Non-Empty String</div>`
      query = queryDriver.findElement('#container').innerHTML()
    })

    describe('.notEmpty()', () => {
      it('should reject', async () => {
        return expect(query.notEmpty().perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.whenRejected(value)', () => {
      it('should resolve', async () => {
        const result = await query.whenRejected('Substitute').perform()
        expect(result).toBe('Substitute')
      })
    })

    describe('.whenRejectedOrFalsy(value)', () => {
      it('should resolve', async () => {
        const result = await query.whenRejectedOrFalsy('Substitute').perform()
        expect(result).toBe('Substitute')
      })
    })
  })

  describe('given non-empty string', () => {
    let query: StringQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">Non-Empty String</div>`
      query = queryDriver.findElement('.container').innerHTML()
    })

    describe('.toNumber', () => {
      it('should reject', async () => {
        try {
          await query.toNumber().perform()
          fail('Expected to throw')
        } catch (err) {
          expect(err).toBeInstanceOf(ArgumentError)
        }
      })
    })

    describe('.equals(value)', () => {
      it('given same value should resolve', async () => {
        const result = await query.equals('Non-Empty String').perform()
        expect(result).toBe(true)
      })

      it('given different value should resolve', async () => {
        const result = await query.equals('Different').perform()
        expect(result).toBe(false)
      })
    })

    describe('.matches(value)', () => {
      it('given matching regex string should resolve', async () => {
        const result = await query.matches('Non-Empty String').perform()
        expect(result).toBe(true)
      })

      it('given non-matching regex string should resolve', async () => {
        const result = await query.matches('x').perform()
        expect(result).toBe(false)
      })

      it('given matching regex should resolve', async () => {
        const result = await query.matches(new RegExp('^Non-Empty String$')).perform()
        expect(result).toBe(true)
      })

      it('given non-matching regex should resolve', async () => {
        const result = await query.matches(new RegExp('x')).perform()
        expect(result).toBe(false)
      })

      it('given invalid regex string should reject', async () => {
        const result = query.matches(')(').perform()
        return expect(result).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.notEmpty()', () => {
      it('should resolve', async () => {
        const result = await query.notEmpty().perform()
        expect(result).toBe(true)
      })
    })
  })

  describe('given empty string', () => {
    let query: StringQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container"></div>`
      query = queryDriver.findElement('.container').innerHTML()
    })

    describe('.toNumber', () => {
      it('should reject', async () => {
        try {
          await query.toNumber().perform()
          fail('Expected to throw')
        } catch (err) {
          expect(err).toBeInstanceOf(ArgumentError)
        }
      })
    })

    describe('.whenRejected(value)', () => {
      it('should resolve', async () => {
        const result = await query.whenRejected('Substitute').perform()
        expect(result).toBe('')
      })
    })

    describe('.whenRejectedOrFalsy(value)', () => {
      it('should resolve', async () => {
        const result = await query.whenRejectedOrFalsy('Substitute').perform()
        expect(result).toBe('Substitute')
      })
    })
  })

  describe('given long string', () => {
    function* repeat(value: string, count: number) {
      for (let i = 0; i < count; ++i) {
        yield value
      }
    }

    let query: StringQuery
    const data = [...repeat('abcdefghijklmnopqrstuvwxyz', 100)].join('')
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">${data}</div>`
      query = queryDriver.findElement('.container').innerHTML()
    })

    it('should resolve', async () => {
      const result = await query.perform()
      expect(result).toEqual(data)
    })
  })

  describe('given number string', () => {
    let query: StringQuery
    beforeAll(() => {
      document.body.innerHTML = `<div class="container">123.321</div>`
      query = queryDriver.findElement('.container').getText()
    })

    describe('.toNumber', () => {
      it('should resolve', async () => {
        const value = await query.toNumber().perform()
        expect(value).toBe(123.321)
      })

      it('should resolve when not float', async () => {
        const value = await query.toNumber({ float: false }).perform()
        expect(value).toBe(123)
      })
    })
  })
})
