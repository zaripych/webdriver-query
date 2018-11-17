import 'chromedriver'
import 'geckodriver'
import 'edgedriver'
import * as path from 'path'
import * as selenium from 'selenium-webdriver'

import { LibraryInstaller } from '../../src/node/library-installer'
import { Query, IQueryConfig } from '../../src/node/query'
import { IConfig } from '../../src/shared/query'
import { platform } from 'os'

// tslint:disable:no-submodule-imports
import * as chrome from 'selenium-webdriver/chrome'
import * as safari from 'selenium-webdriver/safari'

interface IDriverBuilder {
  name: string
  build: () => selenium.ThenableWebDriver
}

const getDrivers: () => IDriverBuilder[] = () => {
  const allBuilders = [
    {
      name: 'chrome-headless',
      build: () => {
        const options = new chrome.Options().detachDriver(true).headless()

        const driver = new selenium.Builder()
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build()
        return driver
      },
    },
    {
      name: 'firefox',
      build: () => {
        const driver = new selenium.Builder().forBrowser('firefox').build()

        return driver
      },
    },
  ]

  if (platform() === 'darwin') {
    allBuilders.push({
      name: 'safari',
      build: () => {
        const driver = new selenium.Builder()
          .usingServer(
            new safari.ServiceBuilder()
              .addArguments('--legacy')
              .build()
              .start()
          )
          .forBrowser('safari')
          .build()

        return driver
      },
    })
  }

  if (platform() === 'win32') {
    allBuilders.push({
      name: 'edge',
      build: () => {
        const driver = new selenium.Builder().forBrowser(selenium.Browser.EDGE).build()

        return driver
      },
    })
  }

  const pattern = process.env.TEST_BROWSERS_PATTERN || '.*chrome.*'

  const regexp = new RegExp(pattern)

  return allBuilders.filter(builder => regexp.test(builder.name))
}

export interface IBuildResult {
  name: string
  driver: selenium.ThenableWebDriver
  query: Query
  installer: LibraryInstaller
  testPagePath: string
  refresh: () => Promise<void>
}

const defaultTestOpts = {
  testPageName: 'test-page.html',
  shouldLoadAtStart: true,
}

const buildAll: (
  builder: IDriverBuilder,
  queryConfig?: Partial<IConfig & IQueryConfig>,
  testOpts?: ITestOpts
) => Promise<IBuildResult> = async (
  builder,
  queryConfig,
  testOpts: ITestOpts = defaultTestOpts
) => {
  const opts = {
    ...defaultTestOpts,
    ...testOpts,
  }
  const testPagePath = 'file://' + path.resolve(__dirname, '../test-pages/' + opts.testPageName)
  const driver = builder.build()
  const installer = new LibraryInstaller(driver)
  const query = new Query(driver, queryConfig)
  if (opts.shouldLoadAtStart) {
    await query.get(testPagePath)
  }
  return {
    name: builder.name,
    driver,
    installer,
    query,
    testPagePath,
    refresh: async () => {
      await query.get(testPagePath)
    },
  }
}

type ITestOpts = Partial<typeof defaultTestOpts>

type TestRunFunc = (
  testDataBuilder: (
    props?: ITestOpts,
    queryConfig?: Partial<IConfig & IQueryConfig>
  ) => Promise<IBuildResult>
) => void

export const describeBrowserTests = (tests: TestRunFunc) => {
  if ('USE_PROMISE_MANAGER' in selenium.promise) {
    selenium.promise.USE_PROMISE_MANAGER = false
  }
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000

  for (const driverBuilder of getDrivers()) {
    describe(`given ${driverBuilder.name}`, () => {
      let resultPromise: Promise<IBuildResult>

      tests((props?: ITestOpts, queryConfig?: Partial<IConfig & IQueryConfig>) => {
        return (resultPromise = buildAll(driverBuilder, queryConfig, props))
      })

      const printBrowserLogs = async () => {
        // tslint:disable:no-console
        const result = await resultPromise
        const driver = result.driver
        const logs = await driver
          .manage()
          .logs()
          .get(selenium.logging.Type.BROWSER)
        if (logs && logs.length > 0) {
          for (const entry of logs) {
            switch (entry.level) {
              case selenium.logging.Level.SEVERE:
                console.error(entry.message)
                break
              case selenium.logging.Level.DEBUG:
                console.debug(entry.message)
                break
              case selenium.logging.Level.INFO:
                console.info(entry.message)
                break
              case selenium.logging.Level.WARNING:
                console.warn(entry.message)
                break
              default:
                console.log(entry.message)
                break
            }
          }
        }
        // tslint:enable:no-console
      }

      afterEach(async () => {
        if (driverBuilder.name.indexOf('chrome') >= 0) {
          await printBrowserLogs()
        }
      })

      afterAll(async () => {
        const result = await resultPromise
        const driver = result.driver
        await driver.close()
        await driver.quit()
      })
    })
  }
}
