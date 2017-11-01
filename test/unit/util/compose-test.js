const test = require('ava')
const compose = require('../../../src/util/compose')

test('should be able to compose multiple callback style functions together', async (t) => {
  t.plan(3)

  const resultsArray = []

  function a (req, res, next) {
    resultsArray.push(0)
    next()
  }

  function b (req, res, next) {
    resultsArray.push(1)
    next()
  }

  function c () {
    resultsArray.push(2)
  }

  const composed = compose([ a, b, c ])

  await composed()

  for (let i = 0; i < resultsArray.length; i++) {
    t.is(resultsArray[i], i)
  }
})

test('should be able to compose multiple async functions together', async (t) => {
  t.plan(3)

  const resultsArray = []

  async function a (req, res, next) {
    resultsArray.push(0)
    next()
  }

  async function b (req, res, next) {
    resultsArray.push(1)
    next()
  }

  async function c () {
    resultsArray.push(2)
  }

  const composed = compose([ a, b, c ])

  await composed()

  for (let i = 0; i < resultsArray.length; i++) {
    t.is(resultsArray[i], i)
  }
})

test('should allow for async functions to wrap each other', async (t) => {
  t.plan(4)

  const resultsArray = []

  async function a (req, res, next) {
    resultsArray.push(0)
    await next() // handle function b
    // this should be the last value pushed
    resultsArray.push(3)
  }

  async function b (req, res, next) {
    resultsArray.push(1)
    next() // handle function c
  }

  async function c () {
    resultsArray.push(2)
  }

  const composed = compose([ a, b, c ])

  await composed()

  for (let i = 0; i < resultsArray.length; i++) {
    t.is(resultsArray[i], i)
  }
})
