import {
  Query,
  AnyQuery,
  StringQuery,
  ConditionQuery,
} from '../../src/browser/query'
import { OutOfOptionsError } from '../../src/shared/errors'

describe('Query', () => {
  const query = new Query()
  document.body.innerHTML = `<div id="object-1" data-loaded="false">Loading data 1...</div>
        <div id="object-2" data-loaded="false">Loading data 2...</div>
        <div id="object-3" data-loaded="true">Data 3</div>
        <div id="object-4" data-loaded="true">Data 4</div>`

  describe('given string sub-queries where some of them resolve and some not', () => {
    const subQueries = [
      query.findElement('#object-1[data-loaded="true"]').getText(),
      query.findElement('#object-2[data-loaded="true"]').getText(),
      query.findElement('#object-3[data-loaded="true"]').getText(),
      query.findElement('#object-4[data-loaded="true"]').getText(),
    ]

    it('.firstTruthy([]) should resolve to first truthy', async () => {
      const firstQuery = query.firstTruthy(subQueries)
      expect(firstQuery.constructor.name).toBe(StringQuery.name)
      const result = await firstQuery.perform()
      expect(result).toBe('Data 3')
    })
  })

  describe('given string sub-queries created using arrow function where some of them resolve and some not', () => {
    it('.firstTruthy([]) should resolve to first truthy', async () => {
      const result = await query
        .firstTruthy(q => [
          q.findElement('#object-1[data-loaded="true"]').getText(),
          q.findElement('#object-2[data-loaded="true"]').getText(),
          q
            .findElements('div')
            .filter(f => f.getAttribute('data-loaded').equals('true'))
            .at(0)
            .getText(),
          q.findElement('#object-4[data-loaded="true"]').getText(),
        ])
        .perform()

      expect(result).toBe('Data 3')
    })
  })

  describe('given string sub-queries all of them rejecting', () => {
    it('.firstTruthy([]) should reject', async () => {
      const result = query
        .firstTruthy(q => [
          q.findElement('#object-1[data-loaded="true"]').getText(),
          q.findElement('#object-2[data-loaded="true"]').getText(),
          q.findElement('#object-3[data-loaded="false"]').getText(),
          q.findElement('#object-4[data-loaded="false"]').getText(),
        ])
        .perform()

      await expect(result).rejects.toBeInstanceOf(OutOfOptionsError)
    })
  })

  describe('given string sub-queries all of them resolving to falsy', () => {
    it('.firstTruthy([]) should reject', async () => {
      const firstQuery = query.firstTruthy(q => [
        q
          .findElement('#object-1')
          .exists()
          .not(),
        q
          .findElement('#object-2')
          .exists()
          .not(),
      ])
      expect(firstQuery.constructor.name).toBe(ConditionQuery.name)

      const result = firstQuery.perform()

      await expect(result).rejects.toBeInstanceOf(OutOfOptionsError)
    })
  })

  describe('given sub-queries of different types all of them resolving to falsy or rejecting', () => {
    it('.firstTruthy([]) should reject', async () => {
      const firstQuery = query.firstTruthy(q => [
        q
          .findElement('#object-1')
          .exists()
          .not(),
        q.findElement('#object-x'),
      ])
      expect(firstQuery.constructor.name).toBe(AnyQuery.name)

      const result = firstQuery.perform()

      await expect(result).rejects.toBeInstanceOf(OutOfOptionsError)
    })
  })
})
