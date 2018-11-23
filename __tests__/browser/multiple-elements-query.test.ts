import * as selenium from 'selenium-webdriver'
import { describeBrowserTests } from '../utils/browser-tests-config'
import { Query } from '../../src/node/query'
import { ArgumentError, NoSuchElementError } from '../../src/shared/errors'

describe('MultipleElementsQuery', () => {
  describeBrowserTests(testDataBuilder => {
    let baseQuery: Query
    beforeAll(async () => {
      const result = await testDataBuilder()
      baseQuery = result.query
    })

    describe('given query targeting multiple elements', () => {
      let query: ReturnType<Query['findElements']>
      beforeEach(() => {
        query = baseQuery.findElements(
          selenium.By.css('#multiple-elements .row')
        )
      })

      it('performing count should work', async () => {
        const numberOfElements = await query.count().perform()
        expect(numberOfElements).toBe(8)
      })

      it('performing `at` should work', async () => {
        const element = await query.at(0).perform()
        expect(element).toBeInstanceOf(selenium.WebElement)

        const innerText = await element.getText()
        expect(innerText.replace(/\s|\n/g, '')).toBe('1Mark2.5Alchemist')
      })

      it('performing `at` with invalid index should throw', async () => {
        await expect(query.at(-1).perform()).rejects.toBeInstanceOf(
          ArgumentError
        )
      })

      it('performing `at` with invalid index should throw', async () => {
        await expect(query.at(9).perform()).rejects.toBeInstanceOf(
          ArgumentError
        )
      })

      it('performing `at` with NaN should throw', async () => {
        await expect(query.at(Number.NaN).perform()).rejects.toBeInstanceOf(
          ArgumentError
        )
      })

      it('performing `filter` with results should work', async () => {
        const alchemists = await query
          .filter(q =>
            q
              .findElement('.column-class')
              .getText()
              .equals('Alchemist')
          )
          .perform()

        expect(alchemists).toBeInstanceOf(Array)
        expect(alchemists.length).toBe(2)

        const firstFound = await alchemists[0].getText()
        expect(firstFound.replace(/\s|\n/g, '')).toBe('1Mark2.5Alchemist')

        const secondFound = await alchemists[1].getText()
        expect(secondFound.replace(/\s|\n/g, '')).toBe('5Gene32Alchemist')
      })

      it('performing `filter` with empty results should work', async () => {
        const knights = await query
          .filter(q =>
            q
              .findElement('.column-class')
              .getText()
              .equals('Knight')
          )
          .perform()

        expect(knights).toBeInstanceOf(Array)
        expect(knights.length).toBe(0)
      })

      it('performing `first` with results should work', async () => {
        const alchemist = await query
          .first(q =>
            q
              .findElement('.column-class')
              .getText()
              .equals('Alchemist')
          )
          .perform()

        expect(alchemist).toBeInstanceOf(selenium.WebElement)

        const firstFound = await alchemist.getText()
        expect(firstFound.replace(/\s|\n/g, '')).toBe('1Mark2.5Alchemist')
      })

      it('performing `first` with no result should throw', async () => {
        await expect(
          query
            .first(q =>
              q
                .findElement('.column-class')
                .getText()
                .equals('Knight')
            )
            .perform()
        ).rejects.toBeInstanceOf(NoSuchElementError)
      })

      it('performing `indexOf` with no result should reject', async () => {
        try {
          await query
            .indexOf(q =>
              q
                .findElement('.column-class')
                .getText()
                .equals('Knight')
            )
            .perform()
        } catch (err) {
          expect(err).toBeInstanceOf(NoSuchElementError)
        }
      })

      it('performing `indexOf` results should work', async () => {
        const result = await query
          .indexOf(q =>
            q
              .findElement('.column-class')
              .getText()
              .equals('Alchemist')
          )
          .perform()
        expect(result).toBe(0)

        const anotherResult = await query
          .indexOf(q =>
            q
              .findElement('.column-name')
              .getText()
              .equals('Danny')
          )
          .perform()
        expect(anotherResult).toBe(3)
      })
    })
  })
})
