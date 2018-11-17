import { locatorToSelector } from '../../src/node/query/locator-to-selector'
import * as selenium from 'selenium-webdriver'
import { ArgumentError } from '../../src/shared/errors'

describe('locatorToSelector', () => {
  describe('given invalid locator object', () => {
    const locator: selenium.By = {}

    it('should throw', () => {
      expect(() => {
        locatorToSelector(locator)
      }).toThrow(ArgumentError)
    })
  })

  describe('given invalid locator non object', () => {
    // @ts-ignore
    const locator: selenium.By = undefined

    it('should throw', () => {
      expect(() => {
        locatorToSelector(locator)
      }).toThrow(ArgumentError)
    })
  })

  describe('given invalid custom locator', () => {
    const locator: selenium.By = new selenium.By('custom', '/path')

    it('should throw', () => {
      expect(() => {
        locatorToSelector(locator)
      }).toThrow(ArgumentError)
    })
  })
})
