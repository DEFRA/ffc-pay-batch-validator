const crypto = require('crypto')

const compareHash = (content, hash) => {
  const fileHash = crypto.createHash('md5').update(content).digest('hex')
  console.log(`File hash: ${fileHash}`)
  console.log(`Validation hash: ${hash}`)
  return fileHash === hash
}

module.exports = {
  compareHash
}
