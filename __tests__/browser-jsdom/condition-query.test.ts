import { Query, ConditionQuery } from '../../src/browser/query'

describe('ConditionQuery', () => {
  let queryDriver: Query
  beforeAll(() => {
    queryDriver = new Query()
  })

  describe('given rejecting parent query', () => {
    let query: ConditionQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">Non-Empty String</div>`
      query = queryDriver.findElement('#container').isDisplayed()
    })

    describe('.not()', () => {
      it('should reject', async () => {
        return expect(query.not().perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('.whenRejected(value)', () => {
      it('should resolve', async () => {
        const result = await query.whenRejected(true).perform()
        expect(result).toBe(true)
      })
    })
  })

  describe('given true value', () => {
    let query: ConditionQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">Non-Empty String</div>`
      query = queryDriver
        .findElement('.container')
        .innerHTML()
        .notEmpty()
    })

    it('should resolve to true', async () => {
      const result = await query.perform()
      expect(result).toBe(true)
    })

    describe('.not()', () => {
      it('should resolve to false', async () => {
        const result = await query.not().perform()
        expect(result).toBe(false)
      })
    })
  })

  describe('given false value', () => {
    let query: ConditionQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">Non-Empty String</div>`
      query = queryDriver
        .findElement('.container')
        .innerHTML()
        .equals('A')
    })

    it('should resolve to false', async () => {
      const result = await query.perform()
      expect(result).toBe(false)
    })

    describe('.not()', () => {
      it('should resolve to true', async () => {
        const result = await query.not().perform()
        expect(result).toBe(true)
      })
    })
  })
})
