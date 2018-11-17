import { describeBrowserTests } from '../../utils/browser-tests-config'
import { Query } from '../../../src/node/query'
import { ThenableWebDriver, By, WebElement } from 'selenium-webdriver'
import workaroundEPipeErrorsIfRequired from '../../utils/workaround-epipe-errors'

interface IForm {
  firstName: string
  lastName: string
  userName: string
  email: string
  addressLine1: string
  addressLine2: string
  country: string
  state: string
  zip: string
}

describe('FormExample', () => {
  describeBrowserTests(testDataBuilder => {
    //

    let query: Query
    let driver: ThenableWebDriver

    describe('given query api', () => {
      beforeAll(async () => {
        const result = await testDataBuilder({
          testPageName: 'form-example.html',
          shouldLoadAtStart: true,
        })
        query = result.query
        driver = result.driver
      })

      const fetchInput = (q: Query, selector: string) =>
        q.findElement(selector).batch(u => ({
          value: u.findElement('input').getAttribute('value'),
          errorMessage: u
            .findElement('.invalid-feedback')
            .getText()
            .whenRejected(''),
        }))

      const fetchSelect = (q: Query, selector: string) =>
        q.findElement(selector).batch(u => ({
          value: u.findElement('select').getAttribute('value'),
          errorMessage: u
            .findElement('.invalid-feedback')
            .getText()
            .whenRejected(''),
        }))

      const fetchForm = (r: Query) =>
        r.batch(q => ({
          wasValidated: q
            .findElement('.id-address-form')
            .class()
            .matches(/.*was-validated.*/),

          firstName: fetchInput(q, '.id-first-name'),
          lastName: fetchInput(q, '.id-last-name'),
          userName: fetchInput(q, '.id-username'),

          email: fetchInput(q, '.id-email'),

          addressLine1: fetchInput(q, '.id-address-line-one'),
          addressLine2: fetchInput(q, '.id-address-line-two'),

          country: fetchSelect(q, '.id-country'),
          state: fetchSelect(q, '.id-state'),
          zip: fetchInput(q, '.id-zip'),
        }))

      const fetchCart = (r: Query) =>
        r.batch(q => ({
          numberOfProducts: q
            .findElement('.id-cart-size')
            .getText()
            .toNumber(),

          products: q.findElements('.id-product').map(p =>
            p.batch(product => ({
              name: product.findElement('.id-product-name').getText(),
              description: product.findElement('.id-product-description').getText(),
              price: product.findElement('.id-price').getText(),
            }))
          ),

          promo: q.findElement('.id-promo-code').getText(),
          promoDiscount: q.findElement('.id-promo-discount').getText(),

          totalPrice: q.findElement('.id-total-price').getText(),
        }))

      const updateForm = async (form: Partial<IForm>) => {
        await query.sequence(q => [
          form.firstName && q.findElement('#firstName').imitateSetText(form.firstName),
          form.lastName && q.findElement('#lastName').imitateSetText(form.lastName),
          form.userName && q.findElement('#username').imitateSetText(form.userName),
          form.email && q.findElement('#email').imitateSetText(form.email),
          form.addressLine1 && q.findElement('#address').imitateSetText(form.addressLine1),
          form.addressLine2 && q.findElement('#address2').imitateSetText(form.addressLine2),
          form.country && q.findElement('#country').imitateSelection({ value: form.country }),
          form.state && q.findElement('#state').imitateSelection({ text: form.state }),
          form.zip && q.findElement('#zip').imitateSetText(form.zip),
        ])
      }

      it('should load the form data', async () => {
        const pageQuery = query.batch(r => ({
          form: fetchForm(r),
          cart: fetchCart(r),

          checkoutButton: query.findElement('.id-checkout-btn'),
        }))

        const initialPage = await pageQuery.perform()

        expect({
          cart: initialPage.cart,
          form: initialPage.form,
        }).toEqual({
          cart: {
            numberOfProducts: 3,
            products: [
              {
                description: 'Brief description',
                name: 'Product name',
                price: '$12',
              },
              {
                description: 'Brief description',
                name: 'Second product',
                price: '$8',
              },
              {
                description: 'Brief description',
                name: 'Third item',
                price: '$5',
              },
            ],
            promo: 'EXAMPLECODE',
            promoDiscount: '-$5',
            totalPrice: '$20',
          },
          form: {
            addressLine1: { errorMessage: '', value: '' },
            addressLine2: { errorMessage: '', value: '' },
            country: { errorMessage: '', value: '' },
            email: { errorMessage: '', value: '' },
            firstName: { errorMessage: '', value: '' },
            lastName: { errorMessage: '', value: '' },
            state: { errorMessage: '', value: '' },
            userName: { errorMessage: '', value: '' },
            wasValidated: false,
            zip: { errorMessage: '', value: '' },
          },
        })

        await updateForm({
          firstName: 'Marko',
          lastName: 'Shlopkin',
          userName: 'markovka',
          email: 'false_email@gmail.com',
          addressLine1: '1 Sussex Str, Sydney',
          country: 'AU',
          // state: 'California',
          zip: '2000',
        })

        await initialPage.checkoutButton.click()

        const filledPage = await pageQuery.perform()

        expect({
          cart: filledPage.cart,
          form: filledPage.form,
        }).toEqual({
          cart: {
            numberOfProducts: 3,
            products: [
              {
                description: 'Brief description',
                name: 'Product name',
                price: '$12',
              },
              {
                description: 'Brief description',
                name: 'Second product',
                price: '$8',
              },
              {
                description: 'Brief description',
                name: 'Third item',
                price: '$5',
              },
            ],
            promo: 'EXAMPLECODE',
            promoDiscount: '-$5',
            totalPrice: '$20',
          },
          form: {
            addressLine1: { errorMessage: '', value: '1 Sussex Str, Sydney' },
            addressLine2: { errorMessage: '', value: '' },
            country: { errorMessage: '', value: 'AU' },
            email: { errorMessage: '', value: 'false_email@gmail.com' },
            firstName: { errorMessage: '', value: 'Marko' },
            lastName: { errorMessage: '', value: 'Shlopkin' },
            state: { errorMessage: 'Please provide a valid state.', value: '' },
            userName: { errorMessage: '', value: 'markovka' },
            wasValidated: true,
            zip: { errorMessage: '', value: '2000' },
          },
        })
      })
    })

    describe('given driver api', () => {
      beforeAll(async () => {
        const result = await testDataBuilder({
          testPageName: 'form-example.html',
          shouldLoadAtStart: true,
        })
        query = result.query
        driver = result.driver
      })

      const fetchInput = async (q: typeof driver, selector: string) => {
        const value = await q
          .findElement(By.css(selector))
          .findElement(By.css('input'))
          .getAttribute('value')

        const errorMessage = await q
          .findElement(By.css(selector))
          .findElement(By.css('.invalid-feedback'))
          .getText()
          .catch(() => Promise.resolve(''))

        return {
          value,
          errorMessage,
        }
      }

      const fetchSelect = async (q: typeof driver, selector: string) => {
        const value = await q
          .findElement(By.css(selector))
          .findElement(By.css('select'))
          .getAttribute('value')

        const errorMessage = await q
          .findElement(By.css(selector))
          .findElement(By.css('.invalid-feedback'))
          .getText()
          .catch(() => Promise.resolve(''))

        return {
          value,
          errorMessage,
        }
      }

      const fetchForm = async (q: typeof driver) => {
        const wasValidated = /.*was-validated.*/.test(
          await q.findElement(By.css('.id-address-form')).getAttribute('class')
        )

        const firstName = await fetchInput(q, '.id-first-name')
        const lastName = await fetchInput(q, '.id-last-name')
        const userName = await fetchInput(q, '.id-username')

        const email = await fetchInput(q, '.id-email')

        const addressLine1 = await fetchInput(q, '.id-address-line-one')
        const addressLine2 = await fetchInput(q, '.id-address-line-two')

        const country = await fetchSelect(q, '.id-country')
        const state = await fetchSelect(q, '.id-state')
        const zip = await fetchInput(q, '.id-zip')

        return {
          wasValidated,
          firstName,
          lastName,
          userName,
          email,
          addressLine1,
          addressLine2,
          country,
          state,
          zip,
        }
      }

      const fetchCart = async (q: typeof driver) => {
        const numberOfProducts = parseInt(
          await q.findElement(By.css('.id-cart-size')).getText(),
          10
        )

        const products = await q.findElements(By.css('.id-product')).then(productElements => {
          return Promise.all(
            productElements.map(async product => {
              const name = await product.findElement(By.css('.id-product-name')).getText()
              const description = await product
                .findElement(By.css('.id-product-description'))
                .getText()
              const price = await product.findElement(By.css('.id-price')).getText()
              return {
                name,
                description,
                price,
              }
            })
          )
        })

        const promo = await q.findElement(By.css('.id-promo-code')).getText()
        const promoDiscount = await q.findElement(By.css('.id-promo-discount')).getText()

        const totalPrice = await q.findElement(By.css('.id-total-price')).getText()

        return {
          numberOfProducts,
          products,
          promo,
          promoDiscount,
          totalPrice,
        }
      }

      const updateForm = async (form: Partial<IForm>) => {
        const q = driver
        if (form.firstName) {
          await q.findElement(By.css('#firstName')).sendKeys(form.firstName)
        }
        if (form.lastName) {
          await q.findElement(By.css('#lastName')).sendKeys(form.lastName)
        }
        if (form.userName) {
          await q.findElement(By.css('#username')).sendKeys(form.userName)
        }
        if (form.email) {
          await q.findElement(By.css('#email')).sendKeys(form.email)
        }
        if (form.addressLine1) {
          await q.findElement(By.css('#address')).sendKeys(form.addressLine1)
        }
        if (form.addressLine2) {
          await q.findElement(By.css('#address2')).sendKeys(form.addressLine2)
        }
        if (form.zip) {
          await q.findElement(By.css('#zip')).sendKeys(form.zip)
        }
      }

      const fetchPage = async () => {
        const form = await fetchForm(driver)
        const cart = await fetchCart(driver)

        const checkoutButton = await query.findElement(By.css('.id-checkout-btn'))
        return {
          form,
          cart,
          checkoutButton,
        }
      }

      let workaround: ReturnType<typeof workaroundEPipeErrorsIfRequired>
      beforeEach(() => {
        workaround = workaroundEPipeErrorsIfRequired(driver)
      })

      afterEach(() => {
        workaround.undo()
      })

      it('should load the form data', async () => {
        const initialPage = await fetchPage()

        expect({
          cart: initialPage.cart,
          form: initialPage.form,
        }).toEqual({
          cart: {
            numberOfProducts: 3,
            products: [
              {
                description: 'Brief description',
                name: 'Product name',
                price: '$12',
              },
              {
                description: 'Brief description',
                name: 'Second product',
                price: '$8',
              },
              {
                description: 'Brief description',
                name: 'Third item',
                price: '$5',
              },
            ],
            promo: 'EXAMPLECODE',
            promoDiscount: '-$5',
            totalPrice: '$20',
          },
          form: {
            addressLine1: { errorMessage: '', value: '' },
            addressLine2: { errorMessage: '', value: '' },
            country: { errorMessage: '', value: '' },
            email: { errorMessage: '', value: '' },
            firstName: { errorMessage: '', value: '' },
            lastName: { errorMessage: '', value: '' },
            state: { errorMessage: '', value: '' },
            userName: { errorMessage: '', value: '' },
            wasValidated: false,
            zip: { errorMessage: '', value: '' },
          },
        })

        await updateForm({
          firstName: 'Marko',
          lastName: 'Shlopkin',
          userName: 'markovka',
          email: 'false_email@gmail.com',
          addressLine1: '1 Sussex Str, Sydney',
          zip: '2000',
        })

        await initialPage.checkoutButton.click()

        const filledPage = await fetchPage()

        expect({
          cart: filledPage.cart,
          form: filledPage.form,
        }).toEqual({
          cart: {
            numberOfProducts: 3,
            products: [
              {
                description: 'Brief description',
                name: 'Product name',
                price: '$12',
              },
              {
                description: 'Brief description',
                name: 'Second product',
                price: '$8',
              },
              {
                description: 'Brief description',
                name: 'Third item',
                price: '$5',
              },
            ],
            promo: 'EXAMPLECODE',
            promoDiscount: '-$5',
            totalPrice: '$20',
          },
          form: {
            addressLine1: { errorMessage: '', value: '1 Sussex Str, Sydney' },
            addressLine2: { errorMessage: '', value: '' },
            country: {
              errorMessage: 'Please select a valid country.',
              value: '',
            },
            email: { errorMessage: '', value: 'false_email@gmail.com' },
            firstName: { errorMessage: '', value: 'Marko' },
            lastName: { errorMessage: '', value: 'Shlopkin' },
            state: { errorMessage: 'Please provide a valid state.', value: '' },
            userName: { errorMessage: '', value: 'markovka' },
            wasValidated: true,
            zip: { errorMessage: '', value: '2000' },
          },
        })
      })
    })
  })
})
