import {
  describeBrowserTests,
  IBuildResult,
} from '../../utils/browser-tests-config'
import { Query } from '../../../src/node/query'
import { WebDriver, By } from 'selenium-webdriver'

describe('TableExample', () => {
  describeBrowserTests(testDataBuilder => {
    let query: Query
    let driver: WebDriver
    let result: IBuildResult

    beforeAll(async () => {
      // tslint:disable-next-line:no-console
      console.time('buildingDriver')

      result = await testDataBuilder({
        testPageName: 'table-example.html',
        shouldLoadAtStart: true,
      })
      query = result.query
      driver = result.driver

      // tslint:disable-next-line:no-console
      console.timeEnd('buildingDriver')
    })

    beforeEach(async () => {
      // tslint:disable-next-line:no-console
      console.time('pageLoad')

      await driver.get(result.testPagePath)

      // tslint:disable-next-line:no-console
      console.timeEnd('pageLoad')
    })

    describe('given query api', () => {
      it('should load the table data', async () => {
        // tslint:disable-next-line:no-console
        console.time('query')

        const queryResult = await query
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

        expect(queryResult).toBeDefined()

        // tslint:disable-next-line:no-console
        console.timeEnd('query')
      })
    })

    describe('given driver api', () => {
      it('should load the table data', async () => {
        // tslint:disable-next-line:no-console
        console.time('driver')

        const rows = await driver.findElements(By.css('.data-row'))
        const rowCols = await Promise.all(
          rows.map(r => r.findElements(By.css('td')))
        )
        const rowColTextPromise = rowCols.map(cols =>
          cols.map(col => col.getText())
        )
        const rowColText = await rowColTextPromise.reduce((acc, item) => {
          return acc.then(accValue =>
            Promise.all(item).then(resolvedRow => {
              accValue.push(resolvedRow)
              return accValue
            })
          )
        }, Promise.resolve<string[][]>([]))

        const driverResult = await rowColText.map(cols => ({
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

        expect(driverResult).toBeDefined()

        // tslint:disable-next-line:no-console
        console.timeEnd('driver')
      })
    })
  })
})
