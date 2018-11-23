<h1 align="center">
  <p align="center">webdriver-query</p>
  <p align="center" style="font-size: 0.5em">
  <a href="https://travis-ci.org/zaripych/webdriver-query"><img src="https://travis-ci.org/zaripych/webdriver-query.svg?branch=master" alt="Travis Build Status"></a>
  </p>
</h1>

## What this does and why you should use it?

The library allows you to query whole pages, multiple objects or elements, forms, tables from Selenium WebDriver supported browser using a single query. If you have a test that has to load a lot of data from the browser then you can use this library to improve its performance.

## Features

- API is similar to Selenium WebDriver - allows seamless replacement for simple queries
- Fluent interface - create complex queries using single `await`
- Load the whole page using single query
- Compose bigger queries using reusable functions
- Create a query once, execute multiple times
- Hides the differences between different driver implementations

## Status - Beta

The core features are complete. The test coverage and quality of the tests are reasonable.

Future plans:

- Publish beta package
- Test in a real test cloud
- Find open source project, convert to `webdriver-query` and prove value

## How it works

**Issue**: back and forth HTTP requests using W3C WebDriver protocol are costly, the API itself doesn't allow batching multiple commands together https://w3c.github.io/webdriver/#commands - tests that deal with a lot of data on the page become very slow

**Solution**: batch multiple operations together into a serializable JavaScript, evaluate in the browser using 'Execute Async Script' command and get all results using single HTTP response

**Value**: Examples from `__tests__/examples` folder demonstrate longer execution time for a Selenium WebDriver based test and shorter execution time for tests that use `webdriver-query`.

> Very roughly, as of `18/11/2018`, on my local machine, the `webdriver-query` runs both of the tests in less than `100ms` on Headless Chrome, but a similar test that uses Selenium WebDriver API ran up to `2sec`. That means we should expect to run more tests for the same amount of test-cloud money.

```bash
yarn run run-examples-query
  √ should load the form data (77ms)
  √ should load the table data (16ms)
...
7.708s
```

```bash
yarn run run-examples-query
  √ should load the form data (1123ms)
  √ should load the table data (2277ms)
...
10.853s
```

The difference between tests is in number of requests made to WebDriver server. The higher total time is due to Headless Chrome startup and initial page load, while the actual test code runs faster than 2.5 sec.

**Surprise**: Edge is the fastest browser to run tests

## Examples

Using Selenium WebDriver

```typescript
const driver = new selenium.Builder().forBrowser('chrome').build()

await driver.get('https://www.google.com/search?q=WebDriver%20protocol')

const elements = await driver.findElements(selenium.By.css('.g .r h3'))

const allText = await Promise.all(elements.map(element => element.getText()))
```

Using webdriver-query

```typescript
const driver = new selenium.Builder().forBrowser('chrome').build()

const query = new Query(driver, {})

await query.get('https://www.google.com/search?q=WebDriver%20protocol')

const allText = await query
  .findElements(selenium.By.css('.g .r h3'))
  .map(element => element.getText())
```

Almost the same. The main difference however is not in the code style and different `Promise` handling or API, but in the number of HTTP requests made under the hood. For the Selenium WebDriver code above the number of requests will depend on the number of elements found on the page, while for `webdriver-query` it will be finite - ~3 requests.

## More examples

### Batch query:

```typescript
const obj = await query.batch(q => ({
  userName: q.findElement('#user-name').getText(),
  password: q.findElement('#password').getText(),
  rememberFlag: q.findElement('#remember-flag').isChecked(),
}))

// obj is an object:
expect(obj).toEqual({
  userName: 'USER',
  password: 'PWD',
  rememberFlag: false,
})
```

### Transform array of elements into objects using map:

```typescript
const arrayOfObjects = await query.findElements('tr').map(q =>
  q.batch(y => ({
    name: y.findElement('td:nth-child(1)').getText(),
    age: y.findElement('td:nth-child(2)').getText(),
    weight: y.findElement('td:nth-child(3)').getText(),
  }))
)
```

### Filter arrays:

```typescript
const array = await query
  .findElements('option')
  .filter(q => q.isSelected())
  .map(s => s.getAttribute('value'))
```

The above example could be accomplished using non-standard CSS selectors using jQuery `'option:selected'` selector, which is part of the library, so the example can be rewritten like so:

```typescript
const array = await query
  .findElements('option:selected')
  .map(s => s.getAttribute('value'))
```

However, filtering is still very useful when the condition depends on one or more child element, but we still need to continue chaining the parent:

```typescript
const highPriorityRows = await query
  .findElements('tr')
  .filter(q =>
    q
      .findElement('.id-priority')
      .getText()
      .matches(/high/)
  )
  .map(s => s.getAttribute('value'))
```

### Waiting

```typescript
await query.waitUntil(q =>
  q
    .findElement('.spinner')
    .exists()
    .not()
)
```

The above example shows how to wait before executing next query. We can chain on top of that to delay the rest of the query and we can also specify timeout:

```typescript
await query
  .waitUntil(
    q =>
      q
        .findElement('.spinner')
        .exists()
        .not(),
    {
      timeout: 5000,
    }
  )
  .findElement('.loaded-data')
```

The number of polls is constant and time between polls changes depending on the timeout. The lower the timeout the lower the time between polls. Even though discouraged, we can still change `pollPeriod` property along the `timeout` property.

### Waiting Using Retry

```typescript
await query.findElement('.loaded-data').retry()
```

Retry has exactly same effect as `waitUntil` where condition is the chain itself. In the above example we going to wait until `.loaded-data` appears in DOM until timeout.

### Executing Multiple Side-Effects in Sequence

```typescript
await query.sequence(q => [
  q.findElement('#increment-button').imitateClick(),
  q.findElement('#submit-button').imitateClick(),
])
```

The library only simulates clicks through JavaScript and cannot provide with exactly same behaviour as though the user clicked. Therefore it is recommended that Selenium WebDriver `click()` API is used. The above example can be rewritten like so:

```typescript
const buttons = await query.findElements('#increment-button, #submit-button')
buttons.reduce((acc, btn) => acc.then(() => btn.click()), Promise.resolve())
```

### Execute JavaScript

```typescript
const obj2 = await query
  .execute(q => {
    return window.config
  })
  .asObject<{ env: string; buildNumber: string }>()
```

The `asObject` portion at the end of the query will assert that the returned value is an object. There are `asElement`, `asString` and `asNumber` variants as well.

### Handling Rejections

```typescript
await query
  .findElement('.not-found')
  .class()
  .whenRejected('')
```

Internally - all that is just a promise chain. The above example shows how to handle exceptions in the chain. If the element is not found, then we cannot get it's class, that's when `whenRejected` allows us to specify default value that is applied when any of the parent queries reject/fail. This is useful for optional elements.

### Handling Page Reload

```typescript
await query
  .findElement('.refresh-btn')
  .imitateClick()
  .expectPageReload()
```

When we caused a side effect that leads to page reload and page reloads during execution of the query, then we can handle that using `expectPageReload` which will expect exception of certain type that is specific to browser's driver.

### More

```typescript
await ...q.class()
await ...q.getCssValue('prop')
await ...q.getAttribute('data-something')
await ...q.isChecked()
await ...q.isSelected()
await ...q.getSize()
await ...q.getLocation()
await ...q.getRect()
await ...q.scrollIntoView()
await ...q.imitateClick()
await ...q.imitateSubmit()
await ...q.imitateClear()
await ...q.imitateAppendText()
await ...q.imitateSetText()
await ...q.imitateSelection()
await ...q.getSelectedOptions()
```

## When this doesn't work

- Your total tests execution time is negligable and you do not want to bring yet another dependency that needs to be maintained and might have bugs

- Clicking, touching, keyboard API are important to be exactly as browser would make them;

  > _A note that the library doesn't limit your usage of the Web Driver API, so we can still fallback to that when required_

- Branching and conditional logic might be an issue;

  > _Because is very fast, however, we can load all conditional data from the browser and then execute logic later_

- Classic non-SPA Web-Server apps will have to embed JavaScript bundle to the rendered web pages to reduce overhead of installing it for every single page-reload
