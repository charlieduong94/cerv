const test = require('ava')

const Router = require('../../../src/Router')

test('#register should throw an error if nothing is given', (t) => {
  const router = new Router()

  try {
    router.register()
  } catch (err) {
    t.true(err.message.includes('route data must be provided'))
  }
})

test('#register should throw an error if unsupported method is provided', (t) => {
  const router = new Router()
  const method = 'unsupported-method'

  try {
    router.register({
      path: '/some/path',
      method,
      middleware: [ function () {} ],
      handler () {}
    })
  } catch (err) {
    t.is(err.message, `Method: "${method}" is not supported`)
  }
})

test('#register should throw error if handler is not specified', (t) => {
  const router = new Router()

  try {
    router.register({
      path: '/some/path',
      method: 'GET',
      middleware: [ function () {} ]
    })
  } catch (err) {
    t.true(err.message.includes('Route handler must be provided'))
  }
})

test('#register should throw an error if handler is not a function', (t) => {
  const router = new Router()

  try {
    router.register({
      path: '/some/path',
      middleware: [ function () {} ],
      handler: {}
    })
  } catch (err) {
    t.true(err.message.includes('handler must be a function'))
  }
})
