import { Query } from '../../src/browser/query'
import { ArgumentError } from '../../src/shared/errors'

describe('Query', () => {
  const query = new Query()

  describe('execute', () => {
    describe('given undefined as parameter', () => {
      const script = undefined

      it('should work', async () => {
        // @ts-ignore
        const queryResult = query.execute(script).perform()
        await expect(queryResult).rejects.toBeInstanceOf(ArgumentError)
      })
    })

    describe('given a lambda which returns string literal', () => {
      const script = () => 'A value'

      it('should work, similar to WebDriver', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBe('A value')
      })
    })

    describe('given a function which returns string literal', () => {
      function script() {
        return 'A value'
      }

      it('should work, similar to WebDriver', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBe('A value')
      })
    })

    describe('given a lambda which returns string literal, converted to string', () => {
      const script = () => 'A value'

      it('should work, similar to WebDriver', async () => {
        const queryResult = await query.execute(script.toString()).perform()
        expect(queryResult).toBe('A value')
      })
    })

    describe('given a function which returns string literal, converted to string', () => {
      function script() {
        return 'A value'
      }

      it('should work, similar to WebDriver', async () => {
        const queryResult = await query.execute(script.toString()).perform()
        expect(queryResult).toBe('A value')
      })
    })

    describe('given no return statement and simple string literal', () => {
      const script = `'A value'`

      it('should work', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBeUndefined()
      })
    })

    describe('given return statement and simple string literal', () => {
      const script = `return 'A value'`

      it('should work', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBe('A value')
      })
    })

    describe('given invalid string literal', () => {
      const script = `'A value`

      it('should throw', async () => {
        const queryResult = query.execute(script).perform()
        await expect(queryResult).rejects.toBeInstanceOf(Error)
      })
    })

    describe('given no return statement', () => {
      const script = `const x = 'A value'`

      it('should work', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBeUndefined()
      })
    })

    describe('given return statement returning a lambda', () => {
      const script = `return () => 'Something'`

      it('should return function, which then will be converted to {} by Selenium', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBeInstanceOf(Function)
      })
    })

    describe('given return statement returning a function', () => {
      const script = `return function A() {};`

      it('should return function, which then will be converted to {} by Selenium', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBeInstanceOf(Function)
      })
    })

    describe('given return statement returning an object', () => {
      const script = `return { "property": "value" };`

      it('should work', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toEqual({ property: 'value' })
      })
    })

    describe('given return statement returning a number', () => {
      const script = `return 42;`

      it('should work', async () => {
        const queryResult = await query.execute(script).perform()
        expect(queryResult).toBe(42)
      })
    })

    describe('given return statement returning first parameter', () => {
      const script = `return arguments[0];`

      it('should work', async () => {
        const queryResult = await query.execute(script, 'Value').perform()
        expect(queryResult).toBe('Value')
      })
    })

    describe('given return statement returning sum of arguments', () => {
      const script = `return arguments[0] + arguments[1];`

      it('should work', async () => {
        const queryResult = await query.execute(script, 40, 2).perform()
        expect(queryResult).toBe(42)
      })
    })

    describe('given return statement throwing exception', () => {
      const script = `throw new Error('Some error happened')`

      it('should work', async () => {
        const queryResult = query.execute(script).perform()
        await expect(queryResult).rejects.toBeInstanceOf(Error)
      })
    })
  })

  describe('given a sub-query', () => {
    document.body.innerHTML = `<div id="id-non-empty">Non empty element</div>`
    const subQuery = query.findElement('#id-non-empty').getText()

    describe('can be used to build custom scripts', () => {
      it('should work', async () => {
        const queryResult = await subQuery.execute(v => v + ' - Custom').perform()
        expect(queryResult).toBe('Non empty element - Custom')
      })
    })
  })

  describe('given a promise returning function', () => {
    const executeQuery = query.execute(() => Promise.resolve(true))

    it('should work', async () => {
      const queryResult = await executeQuery.perform()
      expect(queryResult).toBe(true)
    })
  })
})
