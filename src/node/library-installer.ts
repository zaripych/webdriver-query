import * as Errors from '../shared/errors'
import { IDriver, QueryBuilder } from '../shared/query'
import * as selenium from 'selenium-webdriver'
import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

const browserBundleFileName = 'browser.bundle.js'
export const browserBundlePath = path.join(__dirname, '../../dist/', browserBundleFileName)

const browserBundleMinFileName = 'browser.bundle.min.js'
export const browserBundleMinFilePath = path.join(
  __dirname,
  '../../dist/',
  browserBundleMinFileName
)

export enum InstallMethod {
  executeScript = 'executeScript',
  scriptTag = 'scriptTag',
}

export interface ILibraryInstallerOptions {
  browserBundlePath: string
  installMethod: 'executeScript' | 'scriptTag'
}

const readFile = util.promisify(fs.readFile)

export class LibraryInstaller {
  public static InstallMethod = InstallMethod

  public readonly options: Readonly<ILibraryInstallerOptions>
  private driver: selenium.WebDriver | IDriver
  private get scriptDriver() {
    return this.driver as IDriver
  }

  public static get filePaths() {
    return Object.freeze({
      browserBundlePath,
      browserBundleMinFilePath,
    })
  }

  constructor(driver: selenium.WebDriver | IDriver, options?: Partial<ILibraryInstallerOptions>) {
    const props = {
      browserBundlePath: (options && options.browserBundlePath) || browserBundlePath,
      installMethod: (options && options.installMethod) || 'scriptTag',
    }

    if (props.installMethod !== 'scriptTag' && props.installMethod !== 'executeScript') {
      throw new Errors.ArgumentError(
        'The installMethod is not one of the possible values, currently: ' + props.installMethod
      )
    }

    this.options = Object.freeze(props)
    this.driver = driver
  }

  public install(): Promise<void> {
    const driver = this.scriptDriver

    const bundlePath = this.options.browserBundlePath
    const installMethod = this.options.installMethod

    const paths = [bundlePath]
    const scripts = paths.map(p => readFile(p, 'utf8'))

    return Promise.all(scripts)
      .catch(err => {
        const errMessage =
          `Cannot load browser JavaScript bundle from '${bundlePath}'. ` +
          'The library needs to be installed in the browser to support batch queries. '
        return Promise.reject(new Errors.BootstrapError(errMessage, err))
      })
      .then(contents => {
        const combinedContents = contents.join('\r\n')

        switch (installMethod) {
          case 'executeScript': {
            return driver
              .executeScript(combinedContents)
              .catch(err => {
                const errMessage =
                  `Cannot install browser JavaScript bundle from scripts at '${bundlePath}'. ` +
                  'There seems to be a JavaScript error when ' +
                  'executing the combined script in the browser. '
                return Promise.reject(new Errors.BootstrapError(errMessage, err))
              })
              .then(() => {
                return
              })
          }
          case 'scriptTag': {
            const script = `var scriptTag = document.createElement('script');
    scriptTag.innerHTML = arguments[0];
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(scriptTag);`

            return driver
              .executeScript(script, combinedContents)
              .catch(err => {
                const errMessage =
                  `Cannot install browser JavaScript bundle from scripts at '${bundlePath}'. ` +
                  'There seems to be a JavaScript error when ' +
                  'executing the combined script in the browser. '
                return Promise.reject(new Errors.BootstrapError(errMessage, err))
              })
              .then(() => {
                return
              })
          }
        }
      })
  }

  public isInstalled(): Promise<boolean> {
    const driver = this.scriptDriver
    return driver.executeScript(`return ${QueryBuilder.isInstalledExpression};`) as Promise<boolean>
  }
}
