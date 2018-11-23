import * as selenium from 'selenium-webdriver'
import { webDriverVersion } from './selenium-helpers'
import { gte } from 'semver'

export default function workaroundEPipeErrors(driver: selenium.WebDriver) {
  if (gte(webDriverVersion(), '4.0.0')) {
    return {
      undo: () => {
        return
      },
    }
  }
  let currentCommand = Promise.resolve()
  // Serialize all webdriver commands to prevent EPIPE errors
  const webdriverSchedule = driver.schedule

    // tslint:disable-next-line
  ;(driver.schedule as any) = (
    command: selenium.Command,
    description: string
  ) => {
    currentCommand = currentCommand.then(() =>
      webdriverSchedule.call(driver, command, description).catch(err => {
        currentCommand = Promise.resolve()
        return Promise.reject(err)
      })
    )
    return currentCommand
  }

  return Object.freeze({
    undo: () => {
      ;(driver.schedule as any) = webdriverSchedule
    },
  })
}
