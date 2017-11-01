const test = require('ava')

const Router = require('../../../src/Router')

const assertMiddlewareErrorMessage = 'Route middleware must be a function'

test('should be able to add middleware from constructor', (t) => {
  const middleware = [
    function (res, req, next) { next() }
  ]

  const router = new Router({ middleware })

  t.is(router._middleware, middleware)
})

test('should throw an error if the middleware is not a function', (t) => {
  t.plan(1)

  const middleware = [
    { object: true }
  ]

  try {
    const router = new Router({ middleware })
  } catch (err) {
    t.is(err.message, assertMiddlewareErrorMessage)
  }
})

