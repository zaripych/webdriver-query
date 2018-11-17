import * as selenium from 'selenium-webdriver'
import { describeBrowserTests } from '../utils/browser-tests-config'
import { Query } from '../../src/node/query'
import workaroundEPipeErrors from '../utils/workaround-epipe-errors'
import { elapsedGenerator } from '../../src/shared'

describe('Query', () => {
  describeBrowserTests(testDataBuilder => {
    let name: string
    let driver: selenium.ThenableWebDriver
    let query: Query
    beforeAll(async () => {
      const result = await testDataBuilder()
      driver = result.driver
      query = result.query
      name = result.name
    })

    it(
      'when a second level query like `query.findElement(\'[id="id_0"]\').getText()` is performed in sequence' +
        " multiple times, then timings are better compared to `driver.findElement(By.id('id_0')).getText()`",
      async () => {
        const workaround = workaroundEPipeErrors(driver)

        const numberOfTests = 50
        const elementId = 'id_01'

        const classicApi = () => driver.findElement(selenium.By.id(elementId)).getText()

        const queryApi = () => query.findElement(selenium.By.id(elementId)).getText()

        const testClassicApi = async () => {
          const elapsed = elapsedGenerator()
          let i = 0
          while (i < numberOfTests) {
            await classicApi()
            i += 1
          }
          return elapsed()
        }

        const testQueryApi = async () => {
          const elapsed = elapsedGenerator()
          let i = 0
          while (i < numberOfTests) {
            await queryApi()
            i += 1
          }
          return elapsed()
        }

        const classicResult = await classicApi()
        const queryResult = await queryApi()
        expect(queryResult).toBe(classicResult)

        // warmup
        await testClassicApi()
        await testQueryApi()

        const classicElapsed = await testClassicApi()
        const queryElapsed = await testQueryApi()

        // tslint:disable-next-line:no-console
        console.log(
          'for ' +
            name +
            " `driver.findElement(By.id('id_0')).getText()` took " +
            classicElapsed +
            'ms'
        )
        // tslint:disable-next-line:no-console
        console.log(
          'for ' +
            name +
            " `query.findElement(By.id('id_0')).getText()` took " +
            queryElapsed +
            'ms'
        )

        workaround.undo()
      }
    )

    it(
      'when simple query like `query.execute(...)` is performed in sequence' +
        " multiple times, then timings are worse than Selenium's `driver.execute(...)`" +
        ' due to additional overhead',
      async () => {
        const workaround = workaroundEPipeErrors(driver)

        const numberOfTests = 50

        const classicApi = () => driver.executeScript(() => 'Some Text')

        const queryToExecute = query.execute(() => 'Some Text')
        const queryApi = () => queryToExecute.perform()

        const testClassicApi = async () => {
          const elapsed = elapsedGenerator()
          let i = 0
          while (i < numberOfTests) {
            await classicApi()
            i += 1
          }
          return elapsed()
        }

        const testQueryApi = async () => {
          const elapsed = elapsedGenerator()
          let i = 0
          while (i < numberOfTests) {
            await queryApi()
            i += 1
          }
          return elapsed()
        }

        const classicResult = await classicApi()
        const queryResult = await queryApi()
        expect(queryResult).toBe(classicResult)

        // warmup
        await testClassicApi()
        await testQueryApi()

        const classicElapsed = await testClassicApi()
        const queryElapsed = await testQueryApi()

        // tslint:disable-next-line:no-console
        console.log('for ' + name + ' `driver.execute(...)` took ' + classicElapsed + 'ms')
        // tslint:disable-next-line:no-console
        console.log('for ' + name + ' `query.execute(...)` took ' + queryElapsed + 'ms')

        workaround.undo()
      }
    )
  })
})
