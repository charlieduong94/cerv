function sanitizeUrl (url) {
  let str = url
  const queryIndex = url.indexOf('?')
  if (queryIndex !== -1) {
    str = str.substring(0, queryIndex)
  }

  const hashIndex = url.indexOf('#')
  if (hashIndex !== -1) {
    str = str.substring(0, hashIndex)
  }

  return str
}

module.exports = sanitizeUrl
