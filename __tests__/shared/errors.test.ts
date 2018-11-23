import { ErrorsByName, ErrorLike, QueryError } from '../../src/shared/errors'
import { throwError } from '../utils/throw-helper'
import { QueryBuilder } from '../../src/shared/query'

describe('Errors', () => {
  for (const prop in ErrorsByName) {
    if (prop === 'ErrorLike' || prop === 'QueryError') {
      continue
    }
    describe(prop, () => {
      const ErrorType = ErrorsByName[prop]

      it('should have correct name', () => {
        const instance = new ErrorType('')
        expect(instance.name).toBe(prop)
        expect(instance).toBeInstanceOf(ErrorType)
      })

      it('should have correct message when query is passed', () => {
        const instance = new ErrorType(
          'Message',
          new QueryBuilder()
            .prependConstructor('constructor')
            .appendCall('aCall')
        )
        expect(instance.message).toContain('aCall()')
      })

      it('should have correct message when query is passed', () => {
        const instance = new ErrorType(
          'Message',
          new Error('Another'),
          new QueryBuilder()
            .prependConstructor('constructor')
            .appendCall('aCall2')
        )
        expect(instance.message).toContain('aCall2()')
      })

      it('should capture message', () => {
        const message = 'Test message'
        try {
          throw new ErrorType(message)
        } catch (err) {
          expect(err).toBeInstanceOf(ErrorType)
          expect(err.message).toBe(message)
          expect(err.innerError).toBeUndefined()

          expect(err.toString()).toContain(message)
        }
      })

      it('should capture empty message', () => {
        const message = ''
        try {
          throw new ErrorType(message)
        } catch (err) {
          expect(err.message).toBe(message)
          expect(err.innerError).toBeUndefined()
        }
      })

      it('should not rethrow with different stack when invalid parameters', () => {
        const message = undefined
        try {
          // @ts-ignore
          throw new ErrorType(message)
        } catch (err) {
          expect(err).toBeInstanceOf(ErrorType)
          expect(err.message).toBe('undefined')
          expect(err.innerError).toBeUndefined()

          expect(err.toString()).toContain(message)
        }
      })

      it('should capture innerError and its message', () => {
        const outerMessage = 'Outer error'
        const innerMessage = 'Test message'
        try {
          throw new Error(outerMessage)
        } catch (outerErr) {
          try {
            throw new ErrorType(innerMessage, outerErr)
          } catch (err) {
            expect(err.message).toContain(innerMessage)
            expect(err.innerError).toBeDefined()

            expect(err.toString()).toContain(innerMessage)
            expect(err.toString()).toContain(outerMessage)
          }
        }
      })

      it('should capture innerError and its message with empty stack', () => {
        const outerMessage = 'Outer error'
        const innerMessage = 'Test message'
        try {
          throw new Error(outerMessage)
        } catch (outerErr) {
          try {
            outerErr.stack = ''
            throw new ErrorType(innerMessage, outerErr)
          } catch (err) {
            expect(err.message).toContain(innerMessage)
            expect(err.innerError).toBeDefined()

            expect(err.toString()).toContain(innerMessage)
            expect(err.toString()).toContain(outerMessage)
          }
        }
      })
    })
  }

  describe('ErrorLike', () => {
    describe('when created from Error', () => {
      const errorType = Error
      const message = 'Error message'
      let instance: ErrorLike

      beforeAll(() => {
        instance = new ErrorLike(new errorType(message))
      })

      it('can be created', () => {
        expect(instance).toBeInstanceOf(ErrorLike)
      })

      it('captures name', () => {
        expect(instance.name).toBe(errorType.name)
      })

      it('captures message', () => {
        expect(instance.message).toBe(message)
      })

      it('captures stack', () => {
        expect(instance.stack).toBeTruthy()
      })

      it('can create error', () => {
        const error = ErrorLike.createError(instance)

        expect(error).toBeInstanceOf(errorType)
        expect(error.name).toBe('QueryError')
        expect(error.message).toBe(instance.message)
        expect(error.originalMessage).toBe(instance.originalMessage)
        expect(error.originalStack).toBe(instance.stack)
      })
    })

    describe('when created from QueryError', () => {
      const errorType = QueryError
      const message = 'Error message'
      let instance: ErrorLike

      beforeAll(() => {
        instance = new ErrorLike(new errorType(message))
      })

      it('can be created', () => {
        expect(instance).toBeInstanceOf(ErrorLike)
      })

      it('captures name', () => {
        expect(instance.name).toBe(errorType.name)
      })

      it('captures message', () => {
        expect(instance.message).toBe(message)
      })

      it('captures stack', () => {
        expect(instance.stack).toBeTruthy()
      })

      it('can create error', () => {
        const error = ErrorLike.createError(instance)

        expect(error).toBeInstanceOf(errorType)
        expect(error.name).toBe(errorType.name)
        expect(error.message).toBe(instance.message)
        expect(error.originalMessage).toBe(instance.originalMessage)
        expect(error.originalStack).toBe(instance.stack)
      })
    })

    describe('when created from ErrorLike', () => {
      const errorType = QueryError
      const message = `Error message`
      const innerMessage = `Some other inner error`

      let original: ErrorLike
      let instance: ErrorLike

      beforeAll(() => {
        const errorThrown = new errorType(message, new Error(innerMessage))
        original = new ErrorLike(errorThrown)
        instance = new ErrorLike(original)
      })

      it('can be created', () => {
        expect(instance).toBeInstanceOf(ErrorLike)
      })

      it('captures name', () => {
        expect(instance.name).toBe(errorType.name)
      })

      it('captures messages', () => {
        expect(instance.message).toContain(message)
        expect(instance.message).toContain(innerMessage)
      })

      it('captures stack', () => {
        expect(instance.stack).toBeTruthy()
      })

      it('can create error', () => {
        const error = ErrorLike.createError(instance)

        expect(error).toBeInstanceOf(errorType)
        expect(error.name).toBe(errorType.name)
        expect(error.message).toBe(instance.message)
        expect(error.originalMessage).toBe(instance.originalMessage)
        expect(error.originalStack).toBe(instance.stack)
      })
    })

    describe('when created from QueryError with an innerError', () => {
      const innerErrorType = QueryError
      const errorType = QueryError
      const message = 'Error message'
      const innerMessage = 'Inner error message'

      let instance: ErrorLike

      beforeEach(() => {
        try {
          try {
            throwError(innerErrorType, innerMessage)
          } catch (innerErr) {
            throw new errorType(message, innerErr)
          }
        } catch (err) {
          instance = new ErrorLike(err)
        }
      })

      it('can be created', () => {
        expect(instance).toBeInstanceOf(ErrorLike)
      })

      it('captures name', () => {
        expect(instance.name).toBe(errorType.name)
      })

      it('captures message', () => {
        expect(instance.message).toContain(message)
        expect(instance.message).toContain(innerMessage)
      })

      it('captures stack', () => {
        expect(instance.stack).toBeTruthy()
      })

      it('captures innerError', () => {
        expect(instance.innerError).toBeDefined()
        expect(instance.innerError && instance.innerError.name).toBe(
          innerErrorType.name
        )
        expect(instance.innerError && instance.innerError.message).toBe(
          innerMessage
        )
        expect(instance.innerError && instance.innerError.stack).toBeDefined()
      })

      it('can create error', () => {
        const error = ErrorLike.createError(instance)

        expect(error).toBeInstanceOf(errorType)
        expect(error.name).toBe(errorType.name)
        expect(error.message).toBe(instance.message)
        expect(error.originalMessage).toBe(instance.originalMessage)
        expect(error.originalStack).toBe(instance.stack)
      })
    })

    describe('when created from QueryError with an innerError with another innerError', () => {
      const outerErrorType = QueryError
      const errorType = QueryError
      const message = 'Error message'
      const innerMessage = 'Inner error message'
      const outerMessage = 'Another error'

      let instance: ErrorLike

      beforeEach(() => {
        try {
          try {
            try {
              throwError(Error, innerMessage)
            } catch (innerErr) {
              throw new errorType(message, innerErr)
            }
          } catch (another) {
            throw new outerErrorType(outerMessage, another)
          }
        } catch (err) {
          instance = new ErrorLike(err)
        }
      })

      it('can be created', () => {
        expect(instance).toBeInstanceOf(ErrorLike)
      })

      it('captures name', () => {
        expect(instance.name).toBe(errorType.name)
      })

      it('captures message', () => {
        expect(instance.message).toContain(message)
        expect(instance.message).toContain(innerMessage)
      })

      it('captures stack', () => {
        expect(instance.stack).toBeTruthy()
      })

      it('captures innerError', () => {
        expect(instance.innerError).toBeDefined()
        expect(instance.innerError && instance.innerError.name).toBe(
          outerErrorType.name
        )
        expect(instance.innerError && instance.innerError.message).toContain(
          'Error message'
        )
        expect(instance.innerError && instance.innerError.stack).toBeDefined()
      })

      it('can create error', () => {
        const error = ErrorLike.createError(instance)

        expect(error).toBeInstanceOf(errorType)
        expect(error.name).toBe(errorType.name)
        expect(error.message).toBe(instance.message)
        expect(error.originalMessage).toBe(instance.originalMessage)
        expect(error.originalStack).toBe(instance.stack)
      })
    })

    describe('when created from QueryError with an innerError with another innerError', () => {
      const outerErrorType = QueryError
      const errorType = QueryError
      const message = 'Error message'
      const innerMessage = 'Inner error message'
      const outerMessage = 'Another error'

      let instance: ErrorLike

      beforeEach(() => {
        try {
          try {
            try {
              throwError(QueryError, innerMessage)
            } catch (innerErr) {
              throw new errorType(message, innerErr)
            }
          } catch (another) {
            throw new outerErrorType(outerMessage, another)
          }
        } catch (err) {
          instance = new ErrorLike(err)
        }
      })

      it('can be created', () => {
        expect(instance).toBeInstanceOf(ErrorLike)
      })

      it('captures name', () => {
        expect(instance.name).toBe(errorType.name)
      })

      it('captures message', () => {
        expect(instance.message).toContain(message)
        expect(instance.message).toContain(innerMessage)
      })

      it('captures stack', () => {
        expect(instance.stack).toBeTruthy()
      })

      it('captures innerError', () => {
        expect(instance.innerError).toBeDefined()
        expect(instance.innerError && instance.innerError.name).toBe(
          outerErrorType.name
        )
        expect(instance.innerError && instance.innerError.message).toContain(
          'Error message'
        )
        expect(instance.innerError && instance.innerError.stack).toBeDefined()
      })

      it('can create error', () => {
        const error = ErrorLike.createError(instance)

        expect(error).toBeInstanceOf(errorType)
        expect(error.name).toBe(errorType.name)
        expect(error.message).toBe(instance.message)
        expect(error.originalMessage).toBe(instance.originalMessage)
        expect(error.originalStack).toBe(instance.stack)
      })
    })
  })
})
