module.exports = function rateLimit (opts = {}) {
  const {
    maxCalls,
    perMs = 1000,
    fn,
    onExceed = () => {}
  } = opts
  let calls = 0
  return function rateLimited (...params) {
    if (calls >= maxCalls) return onExceed()
    calls++
    setTimeout(() => { calls-- }, perMs)
    fn(...params)
  }
}
