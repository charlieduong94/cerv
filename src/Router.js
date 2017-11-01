const RadixRouter = require('radix-router')
const assert = require('assert')

const { METHODS } = require('http')
const compose = require('./util/compose')
const sanitizeUrl = require('./util/sanitizeUrl')

const DEFAULT_REQUEST_TIMEOUT = 60 * 1000 * 2

/**
 * Helper function for asserting that the given middleware are functions
 */
function _assertMiddlewareFuncs (middleware) {
  for (const func of middleware) {
    assert(typeof func === 'function', 'Route middleware must be a function')
  }
}

function _handleNotFound(response) {
  response.writeHead(404)
  response.end()
}

class Router {
  /**
   * @constructor
   *
   * @param { Array<Function> } options.middleware - The middleware functions
   * to add to the router
   */
  constructor (options) {
    const {
      middleware
    } = options || {}

    this._router = new RadixRouter()

    if (middleware) {
      _assertMiddlewareFuncs(middleware)
    }

    this._middleware = middleware || []
  }

  /**
   * Registers a route
   *
   * @param { String } routeData.path - the path used to describe the route
   * @param { String } routeData.method - the method for the route
   * @param { Array<Functions> } routeData.middleware - the middleware functions to add for the route
   * @param { Function } routeData.handler - the route's handler function
   */
  register (routeData) {
    assert(routeData, 'An object specifying route data must be provided')

    const { path, middleware, handler } = routeData
    let handlerFuncs

    assert(path, 'The route\'s path must be specified')
    assert(typeof path === 'string', 'The route\'s path attribute must be a string')

    const method = routeData.method || 'GET'
    assert(METHODS.indexOf(method) !== -1, `Method: "${method}" is not supported`)

    if (middleware) {
      assert(middleware instanceof Array, 'The route\'s middleware must be provided as an array')

      _assertMiddlewareFuncs(middleware)
      handlerFuncs = this._middleware.concat(middleware)
    }

    assert(handler, 'Route handler must be provided')
    assert(typeof handler === 'function', 'Route handler must be a function')
    handlerFuncs = handlerFuncs ? handlerFuncs.concat(handler) : this._middleware.concat(handler)

    const router = this._router

    let methods
    let existingRouteData = router.lookup(path)

    if (existingRouteData) {
      methods = existingRouteData.methods
    } else {
      methods = {}
    }

    methods[method] = compose(handlerFuncs)

    router.insert({
      path,
      methods
    })

    return this
  }

  /**
   * Method for adding middleware like the regular koa style
   */
  use (...middleware) {
    _assertMiddlewareFuncs(middleware)
    this._middleware = this._middleware.concat(middleware)

    return this
  }

  lookup (method, url) {
    const routeData = this._router.lookup(sanitizeUrl(url))

    if (routeData) {
      const { methods, params } = routeData
      const handler = methods[method]

      if (handler) {
        return { params, handler }
      }

      return null
    }

    return null
  }

  handle (req, res) {
    req.setTimeout(DEFAULT_REQUEST_TIMEOUT)
    const { method, url } = req
    const data = this.lookup(method, url)
    if (data) {
      const { params, handler } = data
      req.params = params
      handler(req, res)
    } else {
      _handleNotFound(res)
    }
  }
}

/**
 * Generate methods for all of Node's supported HTTP methods
 */
for (const method of METHODS) {
  const funcName = method.toLowerCase()
  Router.prototype[funcName] = function (path, ...handlers) {
    return this.register({
      path,
      method,
      // treat everything before the last handler as
      // middleware
      // (this won't affect anything in the end)
      middleware: handlers.slice(0, handlers.length - 1),
      handler: handlers[handlers.length - 1]
    })
  }
}

module.exports = Router
