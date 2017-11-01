const test = require('ava')
const r2 = require('r2')

const Server = require('../../src/Server')

test.skip('should be able to handle requests', async () => {
  const server = new Server()

  server.get('/', (req, res, next) => {
    const response = JSON.stringify({ hello: 'world' })
    res.setHeader()
    res.end(response)
  });

  await server.listen(8000)

  const response = await r2('http://localhost:8000').json
})
