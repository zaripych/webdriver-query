import { LibraryInstaller } from '../../src/node/library-installer'
import { describeBrowserTests } from '../utils/browser-tests-config'
import * as selenium from 'selenium-webdriver'
import { BootstrapError, ArgumentError } from '../../src/shared/errors'
import { IDriver } from '../../src/shared/query'

describe('LibraryInstaller', () => {
  describeBrowserTests(testDataBuilder => {
    let webDriver: selenium.ThenableWebDriver
    let installer: LibraryInstaller
    let testPagePath: string
    beforeAll(async () => {
      const result = await testDataBuilder()
      webDriver = result.driver
      installer = result.installer
      testPagePath = result.testPagePath
    })

    beforeEach(() => {
      return webDriver.get(testPagePath)
    })

    describe('when installMethod is `invalid`', () => {
      it('cannot be created', () => {
        expect(() => {
          const driver = (webDriver as {}) as IDriver
          installer = new LibraryInstaller(driver, {
            installMethod: 'invalid' as 'scriptTag' | 'executeScript',
          })
        }).toThrow(ArgumentError)
      })
    })

    describe('when installMethod is `executeScript`', () => {
      beforeAll(() => {
        const driver = (webDriver as {}) as IDriver
        installer = new LibraryInstaller(driver, {
          browserBundlePath:
            LibraryInstaller.filePaths.browserBundleMinFilePath,
          installMethod: LibraryInstaller.InstallMethod.executeScript,
        })
      })

      it('can be created', () => {
        expect(installer).toBeInstanceOf(LibraryInstaller)
        expect(installer.options.installMethod).toBe('executeScript')
      })

      it('isInstalled() resolves to false', () => {
        return expect(installer.isInstalled()).resolves.toEqual(false)
      })

      it('install() succeeds', async () => {
        let isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(false)

        await webDriver.get(testPagePath)
        await installer.install()

        isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(true)
      })

      it('install() have to be called again if browser did refresh the page', async () => {
        let isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(false)

        await webDriver.get(testPagePath)
        await installer.install()

        isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(true)

        await webDriver.get(testPagePath)

        isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(false)
      })

      describe('when created with invalid bundle path option', () => {
        beforeAll(() => {
          const driver = (webDriver as {}) as IDriver
          installer = new LibraryInstaller(driver, {
            ...installer.options,
            browserBundlePath: './non-existing-path.js',
          })
        })

        it('can be created', () => {
          expect(installer).toBeInstanceOf(LibraryInstaller)
          expect(installer.options.browserBundlePath).toBe(
            './non-existing-path.js'
          )
        })

        it('fails during installation', () => {
          return expect(installer.install()).rejects.toBeInstanceOf(
            BootstrapError
          )
        })
      })

      describe('when created with driver that fails on executeScript', () => {
        let driver: IDriver
        beforeAll(() => {
          driver = {
            executeScript: jest.fn(() =>
              Promise.reject(new Error('executeScript failed as setup by mock'))
            ),
            executeAsyncScript: jest.fn(() =>
              Promise.reject(
                new Error('executeAsyncScript failed as setup by mock')
              )
            ),
            get: jest.fn(() => Promise.resolve()),
          }
          installer = new LibraryInstaller(driver, {
            installMethod: installer.options.installMethod,
          })
        })

        it('can be created', () => {
          expect(installer).toBeInstanceOf(LibraryInstaller)
          expect(installer.options.browserBundlePath).toBeTruthy()
          expect(installer.options.installMethod).toBe('executeScript')
        })

        it('fails during installation', () => {
          return expect(installer.install())
            .rejects.toBeInstanceOf(BootstrapError)
            .then(() => {
              expect(driver.executeScript).toBeCalled()
            })
        })
      })
    })

    describe('when installMethod is `scriptTag`', () => {
      beforeAll(() => {
        const driver = (webDriver as {}) as IDriver
        installer = new LibraryInstaller(driver, {
          installMethod: LibraryInstaller.InstallMethod.scriptTag,
        })
      })

      it('can be created', () => {
        expect(installer).toBeInstanceOf(LibraryInstaller)
        expect(installer.options.installMethod).toBe('scriptTag')
      })

      it('isInstalled() resolves to false', () => {
        return expect(installer.isInstalled()).resolves.toEqual(false)
      })

      it('install() succeeds', async () => {
        let isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(false)

        await webDriver.get(testPagePath)
        await installer.install()

        isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(true)
      })

      it('install() have to be called again if browser did refresh the page', async () => {
        let isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(false)

        await webDriver.get(testPagePath)
        await installer.install()

        isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(true)

        await webDriver.get(testPagePath)

        isInstalled = await installer.isInstalled()
        expect(isInstalled).toBe(false)
      })

      describe('when created with invalid bundle path option', () => {
        beforeAll(() => {
          const driver = (webDriver as {}) as IDriver
          installer = new LibraryInstaller(driver, {
            ...installer.options,
            browserBundlePath: './non-existing-path.js',
          })
        })

        it('can be created', () => {
          expect(installer).toBeInstanceOf(LibraryInstaller)
          expect(installer.options.browserBundlePath).toBe(
            './non-existing-path.js'
          )
        })

        it('fails during installation', () => {
          return expect(installer.install()).rejects.toBeInstanceOf(
            BootstrapError
          )
        })
      })

      describe('when created with driver that fails on executeScript', () => {
        let driver: IDriver
        beforeAll(() => {
          driver = {
            executeScript: jest.fn(() =>
              Promise.reject(new Error('executeScript mocked failure'))
            ),
            executeAsyncScript: jest.fn(() =>
              Promise.reject(new Error('executeAsyncScript mocked failure'))
            ),
            get: jest.fn(() => Promise.resolve()),
          }
          installer = new LibraryInstaller(driver, {
            installMethod: installer.options.installMethod,
          })
        })

        it('can be created', () => {
          expect(installer).toBeInstanceOf(LibraryInstaller)
          expect(installer.options.browserBundlePath).toBeTruthy()
          expect(installer.options.installMethod).toBe('scriptTag')
        })

        it('fails during installation', () => {
          return expect(installer.install())
            .rejects.toBeInstanceOf(BootstrapError)
            .then(() => {
              expect(driver.executeScript).toBeCalled()
            })
        })
      })
    })
  })
})
