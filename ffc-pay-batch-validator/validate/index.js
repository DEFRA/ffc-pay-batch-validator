const storage = require('../storage')
const { verifyContent } = require('../verify')
const getFiles = require('../get-files')
const success = require('./success')
const failure = require('./failure')
const { storageConnectionString } = require('../config')

const validate = async (context, pendingFilenames, processedFilenames) => {
  storage.connect(storageConnectionString)
  const [checksumFile, batchFile] = await getFiles(context, pendingFilenames)

  if (verifyContent(context, batchFile, checksumFile)) {
    await success(context, pendingFilenames, processedFilenames)
  } else {
    await failure(context, pendingFilenames, processedFilenames)
  }
}

module.exports = validate
