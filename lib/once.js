module.exports = function once (fn) {
  let executed = false
  return function () {
    if (executed) return
    executed = true
    return fn.apply(null, arguments)
  }
}
