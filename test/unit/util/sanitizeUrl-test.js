const test = require('ava')

const sanitizeUrl = require('../../../src/util/sanitizeUrl')

const plainUrl = '/some/url'

test('should strip querystrings from url', (t) => {
  const url = `${plainUrl}?key=value&key2=value2`
  t.is(sanitizeUrl(url), plainUrl)
})

test('should strip hash from url', (t) => {
  const url = `${plainUrl}#hash`
  t.is(sanitizeUrl(url), plainUrl)
})

test('should strip both querystring and hash from url', (t) => {
  const url = `${plainUrl}?key=value#hash`
  t.is(sanitizeUrl(url), plainUrl)
})
