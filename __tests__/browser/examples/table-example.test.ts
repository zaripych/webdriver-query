import { describeBrowserTests } from '../../utils/browser-tests-config'
import { Query } from '../../../src/node/query'
import { ThenableWebDriver, By } from 'selenium-webdriver'
import workaroundEPipeErrorsIfRequired from '../../utils/workaround-epipe-errors'

describe('TableExample', () => {
  describeBrowserTests(testDataBuilder => {
    let query: Query
    let driver: ThenableWebDriver
    describe('given query api', () => {
      beforeAll(async () => {
        const result = await testDataBuilder({
          testPageName: 'table-example.html',
          shouldLoadAtStart: true,
        })
        query = result.query
        driver = result.driver
      })

      it('should load the table data', async () => {
        const result = await query
          .findElements('.data-row')
          .map(r => r.findElements('td').map(col => col.getText()))
          .then(rows =>
            rows.map(cols => ({
              property: cols[0],
              mercury: cols[1],
              venus: cols[2],
              earth: cols[3],
              moon: cols[4],
              mars: cols[5],
              jupiter: cols[6],
              saturn: cols[7],
              uranus: cols[8],
              neptune: cols[9],
              pluto: cols[10],
            }))
          )

        expect(result).toBeDefined()
      })
    })

    describe('given driver api', () => {
      beforeAll(async () => {
        const result = await testDataBuilder({
          testPageName: 'table-example.html',
          shouldLoadAtStart: true,
        })
        query = result.query
        driver = result.driver
      })

      // workaround doesn't allow multiple requests at the
      // same time because of the known EPIPE issue
      let workaround: ReturnType<typeof workaroundEPipeErrorsIfRequired>
      beforeEach(() => {
        workaround = workaroundEPipeErrorsIfRequired(driver)
      })

      afterEach(() => {
        workaround.undo()
      })

      it('should load the table data', async () => {
        const rows = await driver.findElements(By.css('.data-row'))
        const rowCols = await Promise.all(rows.map(r => r.findElements(By.css('td'))))
        const rowColTextPromise = rowCols.map(cols => cols.map(col => col.getText()))
        const rowColText = await rowColTextPromise.reduce((acc, item) => {
          return acc.then(accValue =>
            Promise.all(item).then(resolvedRow => {
              accValue.push(resolvedRow)
              return accValue
            })
          )
        }, Promise.resolve<string[][]>([]))
        const result = await rowColText.map(cols => ({
          property: cols[0],
          mercury: cols[1],
          venus: cols[2],
          earth: cols[3],
          moon: cols[4],
          mars: cols[5],
          jupiter: cols[6],
          saturn: cols[7],
          uranus: cols[8],
          neptune: cols[9],
          pluto: cols[10],
        }))

        expect(result).toBeDefined()
      })
    })
  })
})
