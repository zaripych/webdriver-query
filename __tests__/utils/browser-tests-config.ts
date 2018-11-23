import 'chromedriver'
import 'geckodriver'
import * as path from 'path'
import * as selenium from 'selenium-webdriver'

import { LibraryInstaller } from '../../src/node/library-installer'
import { Query, IQueryConfig } from '../../src/node/query'
import { IConfig } from '../../src/shared/query'
import { platform } from 'os'

// tslint:disable:no-submodule-imports
import * as chrome from 'selenium-webdriver/chrome'
import * as safari from 'selenium-webdriver/safari'

import workaroundEPipeErrors from './workaround-epipe-errors'

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
        const driver = new selenium.Builder()
          .forBrowser(selenium.Browser.EDGE)
          .build()

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
  driver: selenium.WebDriver
  query: Query
  installer: LibraryInstaller
  testPagePath: string
  workaround: { undo: () => void }
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
  const testPagePath =
    'file://' + path.resolve(__dirname, '../test-pages/' + opts.testPageName)
  const driver = await builder.build()
  const installer = new LibraryInstaller(driver)
  const query = new Query(driver, queryConfig)
  if (opts.shouldLoadAtStart) {
    await query.get(testPagePath)
  }
  const workaround = workaroundEPipeErrors(driver)
  return {
    name: builder.name,
    driver,
    installer,
    query,
    testPagePath,
    workaround,
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
  ) => Promise<IBuildResult>,
  testDataCleanup?: (result: IBuildResult) => Promise<void>
) => void

export const describeBrowserTests = (tests: TestRunFunc) => {
  if ('USE_PROMISE_MANAGER' in selenium.promise) {
    selenium.promise.USE_PROMISE_MANAGER = false
  }
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000

  for (const driverBuilder of getDrivers()) {
    describe(`given ${driverBuilder.name}`, () => {
      const builtDrivers: Array<Promise<IBuildResult>> = []

      const cleanup = async (result: IBuildResult) => {
        const driver = result.driver
        await driver.close()
        await driver.quit()
        result.workaround.undo()
      }

      tests(
        (props?: ITestOpts, queryConfig?: Partial<IConfig & IQueryConfig>) => {
          const promise = buildAll(driverBuilder, queryConfig, props)
          builtDrivers.push(promise)
          return promise
        },
        cleanup
      )

      afterAll(async () => {
        const results = await Promise.all(builtDrivers)
        results.reduce(async (acc, result) => {
          await acc

          await cleanup(result)
        }, Promise.resolve())
      })
    })
  }
}
