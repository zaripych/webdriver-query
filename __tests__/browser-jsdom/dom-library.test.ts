import { DomLibrary } from '../../src/browser/dom-library'
import { Errors } from '../../src/browser'

describe('DomLibrary', () => {
  describe('given empty constructor arguments', () => {
    it('can be instantiated', () => {
      const lib = new DomLibrary()
      expect(lib).toBeDefined()
      expect(lib).toBeInstanceOf(DomLibrary)
    })
  })

  describe('given library and DOM with some elements', () => {
    const lib = new DomLibrary()
    beforeAll(() => {
      document.body.innerHTML = `<div id="root-element">
      <span class="child-element-class"></span>
      <p class="multiple-class"></p>
      <p class="multiple-class"></p>
  </div>`
    })

    describe('select', () => {
      describe('given valid CSS selector and no parent element', () => {
        const params = {
          selector: '#root-element',
          parent: null,
        }

        it('should work', () => {
          const elements = lib.select(params.selector, params.parent)
          expect(elements).toBeInstanceOf(Array)
          expect(elements.length).toBe(1)
        })
      })

      describe('given valid empty-result CSS selector and no parent element', () => {
        const params = {
          selector: '#non-existent',
          parent: null,
        }

        it('should work', () => {
          const elements = lib.select(params.selector, params.parent)
          expect(elements).toBeInstanceOf(Array)
          expect(elements.length).toBe(0)
        })
      })

      describe('given valid multiple-elements CSS selector and no parent element', () => {
        const params = {
          selector: '.multiple-class',
          parent: null,
        }

        it('should work', () => {
          const elements = lib.select(params.selector, params.parent)
          expect(elements).toBeInstanceOf(Array)
          expect(elements.length).toBe(2)
        })
      })

      describe('given valid CSS selector and a parent element', () => {
        const params = {
          selector: '.child-element-class',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          const elements = lib.select(params.selector, params.parent)
          expect(elements).toBeInstanceOf(Array)
          expect(elements.length).toBe(1)
        })
      })

      describe('given valid empty-result CSS selector and a parent element', () => {
        const params = {
          selector: '#non-existent-element',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          const elements = lib.select(params.selector, params.parent)
          expect(elements).toBeInstanceOf(Array)
          expect(elements.length).toBe(0)
        })
      })

      describe('given valid multiple-elements CSS selector and a parent element', () => {
        const params = {
          selector: '.multiple-class',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          const elements = lib.select(params.selector, params.parent)
          expect(elements).toBeInstanceOf(Array)
          expect(elements.length).toBe(2)
        })
      })

      describe('given invalid CSS selector', () => {
        const params = {
          selector: '%&^*)&(*&(_*',
          parent: null,
        }

        it('should throw', () => {
          expect(() => lib.select(params.selector, params.parent)).toThrowError(
            Errors.ArgumentError
          )
        })
      })
    })

    describe('selectFirst', () => {
      describe('given valid CSS selector and no parent element', () => {
        const params = {
          selector: '#root-element',
          parent: null,
        }

        it('should work', () => {
          const element = lib.selectFirst(params.selector, params.parent)
          expect(element).toBeInstanceOf(HTMLElement)
        })
      })

      describe('given valid empty-result CSS selector and no parent element', () => {
        const params = {
          selector: '#non-existent',
          parent: null,
        }

        it('should throw', () => {
          expect(() => lib.selectFirst(params.selector, params.parent)).toThrowError(
            Errors.NoSuchElementError
          )
        })
      })

      describe('given valid multiple-elements CSS selector and no parent element', () => {
        const params = {
          selector: '.multiple-class',
          parent: null,
        }

        it('should work', () => {
          const element = lib.selectFirst(params.selector, params.parent)
          expect(element).toBeInstanceOf(HTMLElement)
        })
      })

      describe('given valid CSS selector and a parent element', () => {
        const params = {
          selector: '.child-element-class',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          const element = lib.selectFirst(params.selector, params.parent)
          expect(element).toBeInstanceOf(HTMLElement)
        })
      })

      describe('given valid empty-result CSS selector and a parent element', () => {
        const params = {
          selector: '#non-existent-element',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          expect(() => lib.selectFirst(params.selector, params.parent)).toThrowError(
            Errors.NoSuchElementError
          )
        })
      })

      describe('given valid multiple-elements CSS selector and a parent element', () => {
        const params = {
          selector: '.multiple-class',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          const element = lib.selectFirst(params.selector, params.parent)
          expect(element).toBeInstanceOf(HTMLElement)
        })
      })

      describe('given invalid CSS selector', () => {
        const params = {
          selector: '%&^*)&(*&(_*',
          parent: null,
        }

        it('should throw', () => {
          expect(() => lib.selectFirst(params.selector, params.parent)).toThrowError(
            Errors.ArgumentError
          )
        })
      })
    })

    describe('selectSingle', () => {
      describe('given valid CSS selector and no parent element', () => {
        const params = {
          selector: '#root-element',
          parent: null,
        }

        it('should work', () => {
          const element = lib.selectSingle(params.selector, params.parent)
          expect(element).toBeInstanceOf(HTMLElement)
        })
      })

      describe('given valid empty-result CSS selector and no parent element', () => {
        const params = {
          selector: '#non-existent',
          parent: null,
        }

        it('should throw', () => {
          expect(() => lib.selectSingle(params.selector, params.parent)).toThrowError(
            Errors.NoSuchElementError
          )
        })
      })

      describe('given valid multiple-elements CSS selector and no parent element', () => {
        const params = {
          selector: '.multiple-class',
          parent: null,
        }

        it('should work', () => {
          expect(() => lib.selectSingle(params.selector, params.parent)).toThrowError(
            Errors.SelectorError
          )
        })
      })

      describe('given valid CSS selector and a parent element', () => {
        const params = {
          selector: '.child-element-class',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          const element = lib.selectSingle(params.selector, params.parent)
          expect(element).toBeInstanceOf(HTMLElement)
        })
      })

      describe('given valid empty-result CSS selector and a parent element', () => {
        const params = {
          selector: '#non-existent-element',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          expect(() => lib.selectSingle(params.selector, params.parent)).toThrowError(
            Errors.NoSuchElementError
          )
        })
      })

      describe('given valid multiple-elements CSS selector and a parent element', () => {
        const params = {
          selector: '.multiple-class',
          parent: document.getElementById('root-element'),
        }

        it('should work', () => {
          expect(() => lib.selectSingle(params.selector, params.parent)).toThrowError(
            Errors.SelectorError
          )
        })
      })

      describe('given invalid CSS selector', () => {
        const params = {
          selector: '%&^*)&(*&(_*',
          parent: null,
        }

        it('should throw', () => {
          expect(() => lib.selectSingle(params.selector, params.parent)).toThrowError(
            Errors.ArgumentError
          )
        })
      })
    })

    describe('scrollIntoView', () => {
      let element: HTMLElement
      let scrollIntoViewSpy: jest.Mock

      beforeAll(() => {
        scrollIntoViewSpy = jest.fn()
        element = ({
          scrollIntoView: scrollIntoViewSpy,
        } as any) as HTMLElement
      })

      describe('given element', () => {
        it('should work', () => {
          lib.scrollIntoView(element)
          expect(scrollIntoViewSpy).toHaveBeenCalledWith(...[false])
        })
      })
    })

    describe('isDomElement', () => {
      let element: HTMLElement

      beforeAll(() => {
        const found = document.getElementById('root-element')
        if (!found) {
          throw new Error('Cannot find the element')
        }
        element = found
      })

      describe('given element', () => {
        it('should work', () => {
          const result = lib.isDomElement(element)
          expect(result).toBe(true)
        })
      })
    })
  })

  describe('imitateSelection', () => {
    const initDomWithMocks = (dom: string) => {
      const events = []
      const registerEvent = (name: string) => (evt: Event) => {
        events.push((evt.target as any).id + '-' + name)
        evt.stopPropagation()
      }

      const optionsOnClick = jest.fn(registerEvent('click'))

      const selectOnClick = jest.fn(registerEvent('click'))
      const selectOnChange = jest.fn(registerEvent('change'))
      const selectOnBlur = jest.fn(registerEvent('blur'))
      const selectOnFocus = jest.fn(registerEvent('focus'))

      document.body.innerHTML = dom

      document.querySelectorAll('#sel').forEach((select: HTMLSelectElement) => {
        select.onclick = selectOnClick
        select.onchange = selectOnChange
        select.onblur = selectOnBlur
        select.onfocus = selectOnFocus
      })

      document.querySelectorAll('#sel option').forEach((option: HTMLOptionElement) => {
        option.onclick = optionsOnClick
      })

      return {
        optionsOnClick,
        selectOnChange,
        selectOnBlur,
        selectOnFocus,
        events,
      }
    }

    const selectElement = () => document.getElementById('sel') as HTMLSelectElement

    const getOpt = (i: number) => document.getElementById(`opt${i}`)

    describe('given single-select select element with no-value unselected options', () => {
      const lib = new DomLibrary()

      let mocks: ReturnType<typeof initDomWithMocks>

      beforeEach(() => {
        mocks = initDomWithMocks(`<select id="sel">
        <option id="opt1">Option 1</option>
        <option id="opt2">Option 2</option>
        <option id="opt3">Option 3</option>
        <option id="opt4">Option 4</option>
        <option id="opt5">Option 5</option>
        <option id="opt6">Option 6</option>
    </select>`)
      })

      describe('when selecting single element that exists', () => {
        const select = () => lib.imitateSelection(selectElement(), { value: 'Option 1' })

        it('should work', () => {
          expect(lib.isSelected(getOpt(1))).toBe(true)

          select()

          expect(lib.isSelected(getOpt(1))).toBe(true)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-click',
            'sel-click', // <- we clicked same option
          ])
        })
      })

      describe('when selecting single element that exists, different from current selection', () => {
        const select = () => lib.imitateSelection(selectElement(), { value: 'Option 2' })

        it('should work', () => {
          expect(lib.isSelected(getOpt(1))).toBe(true)

          select()

          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(true)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-click',
            'sel-change',
            'sel-click',
          ])
        })
      })

      describe('when selecting element that doesnt exists', () => {
        const select = () => lib.imitateSelection(selectElement(), { value: 'Alt Option 1' })

        it('should work', () => {
          expect(select).toThrow()
        })
      })

      describe('when selecting multiple elements', () => {
        const select = () =>
          lib.imitateSelection(selectElement(), [{ value: 'Option 1' }, { value: 'Option 2' }])

        it('should throw', () => {
          expect(select).toThrow()
        })
      })
    })

    describe('given single-select select element with preselected option', () => {
      const lib = new DomLibrary()

      let mocks: ReturnType<typeof initDomWithMocks>

      beforeEach(() => {
        mocks = initDomWithMocks(`<select id="sel">
        <option id="opt1">Option 1</option>
        <option id="opt2">Option 2</option>
        <option id="opt3" selected>Option 3</option>
        <option id="opt4">Option 4</option>
        <option id="opt5">Option 5</option>
        <option id="opt6">Option 6</option>
    </select>`)
      })

      describe('when selecting single element that exists', () => {
        const select = () => lib.imitateSelection(selectElement(), { text: 'Option 3' })

        it('should work', () => {
          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(3))).toBe(true)

          select()

          expect(lib.isSelected(getOpt(3))).toBe(true)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-click',
            'sel-click', // <- we clicked same option
          ])
        })
      })

      describe('when selecting single element that exists, different from current selection', () => {
        const select = () => lib.imitateSelection(selectElement(), { value: 'Option 2' })

        it('should work', () => {
          expect(lib.isSelected(getOpt(3))).toBe(true)

          select()

          expect(lib.isSelected(getOpt(3))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(true)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-click',
            'sel-change',
            'sel-click',
          ])
        })
      })
    })

    describe('given multi-select select element with no preselected options', () => {
      const lib = new DomLibrary()

      let mocks: ReturnType<typeof initDomWithMocks>

      beforeEach(() => {
        mocks = initDomWithMocks(`<select id="sel" multiple value="">
        <option id="opt1">Option 1</option>
        <option id="opt2">Option 2</option>
        <option id="opt3">Option 3</option>
        <option id="opt4">Option 4</option>
        <option id="opt5">Option 5</option>
        <option id="opt6">Option 6</option>
    </select>`)
      })

      describe('when selecting single element that exists', () => {
        const select = () => lib.imitateSelection(selectElement(), { text: 'Option 3' })

        it('should work', () => {
          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)

          select()

          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)
          expect(lib.isSelected(getOpt(3))).toBe(true)
          expect(lib.isSelected(getOpt(4))).toBe(false)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-change',
            'opt3-click',
          ])
        })
      })

      describe('when selecting multiple elements that exists', () => {
        const select = () =>
          lib.imitateSelection(selectElement(), [{ text: 'Option 3' }, { text: 'Option 4' }])

        it('should work', () => {
          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)
          expect(lib.isSelected(getOpt(3))).toBe(false)
          expect(lib.isSelected(getOpt(4))).toBe(false)

          select()

          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)
          expect(lib.isSelected(getOpt(3))).toBe(true)
          expect(lib.isSelected(getOpt(4))).toBe(true)
          expect(lib.isSelected(getOpt(5))).toBe(false)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-change',
            'opt3-click',
            'sel-change',
            'opt4-click',
          ])
        })
      })
    })

    describe('given multi-select select element with preselected options', () => {
      const lib = new DomLibrary()

      let mocks: ReturnType<typeof initDomWithMocks>

      beforeEach(() => {
        mocks = initDomWithMocks(`<select id="sel" multiple value="">
        <option id="opt1">Option 1</option>
        <option id="opt2">Option 2</option>
        <option id="opt3">Option 3</option>
        <option id="opt4">Option 4</option>
        <option id="opt5" selected>Option 5</option>
        <option id="opt6" selected>Option 6</option>
    </select>`)
      })

      describe('when selecting single element that exists', () => {
        const select = () => lib.imitateSelection(selectElement(), { text: 'Option 3' })

        it('should work', () => {
          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)
          // ...
          expect(lib.isSelected(getOpt(5))).toBe(true)
          expect(lib.isSelected(getOpt(6))).toBe(true)

          select()

          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)
          expect(lib.isSelected(getOpt(3))).toBe(true)
          expect(lib.isSelected(getOpt(4))).toBe(false)
          expect(lib.isSelected(getOpt(5))).toBe(false)
          expect(lib.isSelected(getOpt(6))).toBe(false)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-change',
            'opt3-click',
          ])

          expect(lib.selectedOptionsOf(selectElement())).toEqual([
            {
              text: 'Option 3',
              value: 'Option 3',
            },
          ])
        })
      })

      describe('when selecting multiple elements that exists', () => {
        const select = () =>
          lib.imitateSelection(selectElement(), [{ text: 'Option 3' }, { text: 'Option 4' }])

        it('should work', () => {
          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)
          expect(lib.isSelected(getOpt(3))).toBe(false)
          expect(lib.isSelected(getOpt(4))).toBe(false)
          expect(lib.isSelected(getOpt(5))).toBe(true)
          expect(lib.isSelected(getOpt(6))).toBe(true)

          select()

          expect(lib.isSelected(getOpt(1))).toBe(false)
          expect(lib.isSelected(getOpt(2))).toBe(false)
          expect(lib.isSelected(getOpt(3))).toBe(true)
          expect(lib.isSelected(getOpt(4))).toBe(true)
          expect(lib.isSelected(getOpt(5))).toBe(false)
          expect(lib.isSelected(getOpt(6))).toBe(false)

          expect(mocks.events).toEqual([
            //
            'sel-focus',
            'sel-change',
            'opt3-click',
            'sel-change',
            'opt4-click',
          ])

          expect(lib.selectedOptionsOf(selectElement())).toEqual([
            {
              text: 'Option 3',
              value: 'Option 3',
            },
            {
              text: 'Option 4',
              value: 'Option 4',
            },
          ])
        })
      })
    })
  })
})
