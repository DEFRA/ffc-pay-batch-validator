async function retry (fn, retriesLeft = 10, interval = 1000, exponential = true) {
  try {
    return (await fn())
  } catch (err) {
    if (retriesLeft) {
      await new Promise(resolve => setTimeout(resolve, interval))
      return retry(fn, retriesLeft - 1, exponential ? interval * 2 : interval, exponential)
    } else {
      throw err
    }
  }
}

module.exports = retry
