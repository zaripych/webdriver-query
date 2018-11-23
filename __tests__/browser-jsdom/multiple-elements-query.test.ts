import { Query, MultipleElementsQuery } from '../../src/browser/query'

describe('MultipleElementsQuery', () => {
  let queryDriver: Query
  beforeAll(() => {
    queryDriver = new Query()
  })

  describe('given multiple elements', () => {
    let query: MultipleElementsQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">
                <div class="element">First</div>
                <div class="element disabled">Second</div>
                <div class="element" data-id="third">Third</div>
                <span class="element">Fourth</span>
                <div class="element selected">Fifth</div>
                <div class="element">Sixth</div>
            </div>`
      query = queryDriver.findElements('.container .element')
    })

    it('findElements should resolve to non-empty array', async () => {
      const result = await query.perform()
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(6)
    })

    describe('findElements().map()', () => {
      it('should work', async () => {
        const result = await query.map(q => q.getText()).perform()
        expect(result).toEqual([
          'First',
          'Second',
          'Third',
          'Fourth',
          'Fifth',
          'Sixth',
        ])
      })

      describe('findElements().map().map()', () => {
        it('should work', async () => {
          const result = await query
            .map(q => q.getText())
            .map(text => text.length())
            .perform()
          expect(result).toEqual([
            'First'.length,
            'Second'.length,
            'Third'.length,
            'Fourth'.length,
            'Fifth'.length,
            'Sixth'.length,
          ])
        })
      })
    })

    describe('findElements().count()', () => {
      it('should resolve to correct count', async () => {
        const result = await query.count().perform()
        expect(result).toBe(6)
      })
    })

    describe('findElements().at(index)', () => {
      it('given valid index should resolve', async () => {
        const result = await query.at(0).perform()
        expect(result).toBeInstanceOf(HTMLElement)
        expect(result.innerHTML).toBe('First')
      })

      it('given invalid index should reject', async () => {
        await expect(query.at(7).perform()).rejects.toBeInstanceOf(Error)
      })

      it('given invalid index should reject', async () => {
        await expect(query.at(-7).perform()).rejects.toBeInstanceOf(Error)
      })

      it('given invalid number should reject', async () => {
        await expect(query.at(-7.4).perform()).rejects.toBeInstanceOf(Error)
      })
    })

    describe('findElements().first(condition)', () => {
      it('given condition that resolves should resolve', async () => {
        const result = await query
          .first(q => q.getTagName().equals('span'))
          .perform()
        expect(result.innerHTML).toBe('Fourth')
      })

      it('given condition that rejects should reject', async () => {
        await expect(
          query
            .first(q =>
              q
                .findElement('@#$%^&*')
                .getTagName()
                .equals('span')
            )
            .perform()
        ).rejects.toBeInstanceOf(Error)
      })

      it("given condition that doesn't match any of the elements should reject", async () => {
        await expect(
          query.first(q => q.getTagName().equals('X')).perform()
        ).rejects.toBeInstanceOf(Error)
      })
    })

    describe('findElements().filter(condition)', () => {
      it('given condition that matches single element, should resolve to a single element', async () => {
        const result = await query
          .filter(q => q.getTagName().equals('span'))
          .perform()
        expect(result).toBeTruthy()
        expect(result.length).toBe(1)
      })

      it('given condition that rejects, should reject', async () => {
        await expect(
          query
            .filter(q =>
              q
                .findElement('@#$%^&*')
                .getTagName()
                .equals('span')
            )
            .perform()
        ).rejects.toBeInstanceOf(Error)
      })

      it("given condition that doesn't match any of the elements should resolve to empty", async () => {
        await expect(
          query.filter(q => q.getTagName().equals('X')).perform()
        ).resolves.toMatchObject([])
      })
    })

    describe('findElements().indexOf(condition)', () => {
      it('given condition that resolves should resolve to correct index', async () => {
        const result = await query
          .indexOf(q => q.getTagName().equals('span'))
          .perform()
        expect(result).toBe(3)
      })

      it('given condition that rejects should reject', async () => {
        await expect(
          query
            .indexOf(q =>
              q
                .findElement('@#$%^&*')
                .getTagName()
                .equals('span')
            )
            .perform()
        ).rejects.toBeInstanceOf(Error)
      })

      it("given condition that doesn't match any of the elements should reject", async () => {
        await expect(
          query.indexOf(q => q.getTagName().equals('X')).perform()
        ).rejects.toBeInstanceOf(Error)
      })
    })
  })

  describe('given empty elements', () => {
    let query: MultipleElementsQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">
            </div>`
      query = queryDriver.findElements('.container .element')
    })

    describe('findElement.first(condition)', () => {
      it('should reject given any condition', async () => {
        await expect(
          query.first(q => q.getTagName().equals('X')).perform()
        ).rejects.toBeInstanceOf(Error)
      })
    })

    describe('findElements().filter(condition)', () => {
      it('given any condition should resolve to empty', async () => {
        await expect(
          query.filter(q => q.getTagName().equals('X')).perform()
        ).resolves.toMatchObject([])
      })
    })

    describe('findElements().indexOf(condition)', () => {
      it('given any should reject', async () => {
        await expect(
          query.indexOf(q => q.getTagName().equals('X')).perform()
        ).rejects.toBeInstanceOf(Error)
      })
    })

    describe('map()', () => {
      it('should resolve', async () => {
        const result = await query.map(q => q.getTagName()).perform()
        await expect(result).toEqual([])
      })
    })
  })

  describe('given multiple elements query based on parent element', () => {
    let parent: MultipleElementsQuery
    let query: MultipleElementsQuery
    beforeAll(() => {
      document.body.innerHTML = `
            <div class="container">
                <div class="element">First</div>
                <div class="element disabled">Second</div>
                <div class="element" data-id="third">Third</div>
                <span class="element">Fourth</span>
                <div class="element selected">Fifth</div>
                <div class="element">Sixth</div>
            </div>
            <div class="container">
                <div class="element">7</div>
                <div class="element">8</div>
                <div class="element">9</div>
                <div class="element">10</div>
                <div class="element">11</div>
                <div class="element">12</div>
            </div>`
      parent = queryDriver.findElements('.container')
      query = parent.at(0).findElements('.element')
    })

    it('findElements should resolve to non-empty array', async () => {
      const result = await query.perform()
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(6)
    })

    it('parent.map(child.map()) should work', async () => {
      const result = await parent
        .map(container =>
          container.findElements('.element').map(el => el.getText())
        )
        .perform()
      expect(result).toEqual([
        ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'],
        ['7', '8', '9', '10', '11', '12'],
      ])
    })

    it('parent.map(child.map()).at(0) should work', async () => {
      const result = await parent
        .map(container =>
          container.findElements('.element').map(el => el.getText())
        )
        .at(0)
        .perform()
      expect(result).toEqual([
        'First',
        'Second',
        'Third',
        'Fourth',
        'Fifth',
        'Sixth',
      ])
    })
  })
})
