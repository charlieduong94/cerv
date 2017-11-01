const test = require('ava')

const Router = require('../../../src/Router')

const assertMiddlewareErrorMessage = 'Route middleware must be a function'

test('#use should add middleware to the middleware', (t) => {
  function middlewareFunc (res, req, next) { next() }

  const router = new Router()
  router.use(middlewareFunc)

  t.deepEqual(router._middleware, [ middlewareFunc ])
})

test('#use be able to add multiple middleware funcs', (t) => {
  function middlewareFuncA (res, req, next) { next() }
  function middlewareFuncB (res, req, next) { next() }

  const router = new Router()
  router.use(middlewareFuncA, middlewareFuncB)

  t.deepEqual(router._middleware, [
    middlewareFuncA,
    middlewareFuncB
  ])
})

test('#use should append to existing middleware', (t) => {
  function middlewareFuncA (res, req, next) { next() }
  function middlewareFuncB (res, req, next) { next() }
  function middlewareFuncC (res, req, next) { next() }

  const router = new Router({ middleware: [ middlewareFuncA ] })
  router.use(middlewareFuncB, middlewareFuncC)

  t.deepEqual(router._middleware, [
    middlewareFuncA,
    middlewareFuncB,
    middlewareFuncC
  ])
})

test('#use should throw error if middleware is not a function', (t) => {
  const notMiddleware = { object: true }
  const router = new Router()

  try {
    router.use(notMiddleware)
  } catch (err) {
    t.is(err.message, assertMiddlewareErrorMessage)
  }
})
