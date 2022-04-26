const crypto = require('crypto')

const verifyContent = (context, content, hash) => {
  const fileHash = crypto.createHash('sha256').update(content).digest('hex')
  const isValid = fileHash === hash

  if (isValid) {
    context.log('File content successfully verified')
  } else {
    context.log('File verification failed')
    context.log(`File hash: ${fileHash}`)
    context.log(`Validation hash: ${hash}`)
  }
  return isValid
}

module.exports = {
  verifyContent
}
