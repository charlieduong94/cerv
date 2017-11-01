function noop () {}

/**
 * Converts an array of functions into a
 * single function that chains each other
 */
function compose (functions) {
  let nextFunc

  for (let i = functions.length - 1; i >= 0; i--) {
    let currentFunc = functions[i]
    let currentNextFunc = nextFunc || noop
    nextFunc = (req, res) => {
      return currentFunc(req, res, () => currentNextFunc(req, res))
    }
  }

  return nextFunc
}

module.exports = compose
