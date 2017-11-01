/**
 * A thin wrapper around http.Server and
 * the underlying router
 */

const http = require('http')
const { METHODS } = http

const Router = require('./Router')

class Server {
  constructor (options) {
    this._router = new Router()
    this._server = http.createServer((req, res) =>
      this._router.handle(req, res))
  }

  use (...args) {
    this._router.use(...args)
  }

  async listen (port) {
    return new Promise((resolve) => {
      this._server.listen(port, resolve)
    })
  }

  close () {
    this._server.close()
  }
}

/**
 * Generate methods for all of Node's supported HTTP methods
 */
for (const method of METHODS) {
  const funcName = method.toLowerCase()
  Server.prototype[funcName] = function (...args) {
    this._router[funcName](...args)
    return this
  }
}

module.exports = Server
