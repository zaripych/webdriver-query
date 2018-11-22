import * as selenium from 'selenium-webdriver'
import { Query } from '../../src/node/query'
import 'chromedriver'

describe('README', () => {
  it('driver code works', async () => {
    const driver = new selenium.Builder().forBrowser('chrome').build()

    await driver.get('https://www.google.com/search?q=WebDriver%20protocol')

    const elements = await driver.findElements(selenium.By.css('.g .r h3'))

    const allText = await Promise.all(
      elements.map(element => element.getText())
    )

    expect(allText).toBeDefined()
    expect(allText.length).toBeGreaterThan(0)
  })

  it('query code works', async () => {
    const driver = new selenium.Builder().forBrowser('chrome').build()

    const query = new Query(driver, {})

    await query.get('https://www.google.com/search?q=WebDriver%20protocol')

    const allText = await query
      .findElements(selenium.By.css('.g .r h3'))
      .map(element => element.getText())

    expect(allText).toBeDefined()
    expect(allText.length).toBeGreaterThan(0)
  })

  it.skip('rest of the query code compiles at least', async () => {
    const driver = new selenium.Builder().forBrowser('chrome').build()

    const query = new Query(driver, {})

    const obj = await query.batch(q => ({
      userName: q.findElement('#user-name').getText(),
      password: q.findElement('#password').getText(),
      rememberFlag: q.findElement('#remember-flag').isChecked(),
    }))

    expect(obj).toEqual({
      userName: 'USER',
      password: 'PWD',
      rememberFlag: false,
    })

    const arrayOfObjects = await query.findElements('tr').map(q =>
      q.batch(y => ({
        name: y.findElement('td:nth-child(1)').getText(),
        age: y.findElement('td:nth-child(2)').getText(),
        weight: y.findElement('td:nth-child(3)').getText(),
      }))
    )

    const array = await query
      .findElements('option')
      .filter(q => q.isSelected())
      .map(s => s.getAttribute('value'))

    const highPriorityRows = await query
      .findElements('tr')
      .filter(q =>
        q
          .findElement('.id-priority')
          .getText()
          .matches(/high/)
      )
      .map(s => s.getAttribute('value'))

    await query.waitUntil(
      q =>
        q
          .findElement('.spinner')
          .exists()
          .not(),
      {
        timeout: 5000,
      }
    )

    await query.sequence(q => [
      q.findElement('#increment-button').imitateClick(),
      q.findElement('#submit-button').imitateClick(),
    ])

    const buttons = await query.findElements(
      '#increment-button, #submit-button'
    )
    buttons.reduce((acc, btn) => acc.then(() => btn.click()), Promise.resolve())

    const obj2 = await query
      .execute(param => {
        // @ts-ignore
        return window.config
      }, 1)
      .asObject()
  })
})
