const test = require('ava')

const Router = require('../../../src/Router')

const sinon = require('sinon')
const proxyquire = require('proxyquire')
proxyquire.noPreserveCache()

test.beforeEach('prepare sandbox', (t) => {
  t.context = {
    sandbox: sinon.sandbox.create()
  }
})

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

test('#register should throw an error if the path provided is not a string', (t) => {
  const router = new Router()

  try {
    router.register({
      path: {},
      middleware: [ function () {} ],
      handler () {}
    })
  } catch (err) {
    t.true(err.message.includes('path attribute must be a string'))
  }
})

test('#register should throw an error if the path provided is not a string', (t) => {
  t.plan(0)

  const { sandbox } = t.context
  const composeStub = sandbox.stub()

  const Router = proxyquire('../../../src/Router', {
    './util/compose': composeStub
  })

  const router = new Router()

  const handler = function () {}
  const middlewareFunc = function () {}

  router.register({
    path: '/some/path',
    middleware: [ middlewareFunc ],
    handler
  })

  sandbox.assert.calledOnce(composeStub)
  sandbox.assert.calledWith(composeStub, [ middlewareFunc, handler ])
})

test('#register should push the path and the composed handler into ' +
'the underlying router if path does not exist', (t) => {
  t.plan(0)

  const { sandbox } = t.context
  const router = new Router()

  const underlyingPathRouter = router._router

  const insertStub = sandbox.stub(underlyingPathRouter, 'insert')

  const path = '/some/path'

  router.register({
    path,
    handler () {}
  })

  sandbox.assert.calledOnce(insertStub)
  sandbox.assert.calledWith(insertStub, sandbox.match((input) =>
    input.path === path &&
    typeof input.methods.GET === 'function' &&
    Object.keys(input.methods).length === 1
  ))
})

test('#register should override the current handler for a path and method', (t) => {
  t.plan(1)

  const { sandbox } = t.context
  const router = new Router()

  const path = '/some/path'

  const underlyingPathRouter = router._router

  const originalHandler = function () {}

  underlyingPathRouter.insert({
    path,
    methods: {
      GET: originalHandler
    }
  })

  const insertStub = sandbox.stub(underlyingPathRouter, 'insert')

  router.register({
    path,
    handler () {}
  })

  sandbox.assert.calledOnce(insertStub)

  const routeData = underlyingPathRouter.lookup(path)

  t.true(routeData.methods.GET !== originalHandler)
})
