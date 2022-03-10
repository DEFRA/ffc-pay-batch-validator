const storage = require('../storage')
const { verifyContent } = require('../checksum')
const getFiles = require('../get-files')
const success = require('./success')
const failure = require('./failure')

const validate = async (pendingFilenames, processedFilenames) => {
  storage.connect(process.env.BATCH_STORAGE)

  const [checksumFile, batchFile] = await getFiles(pendingFilenames)

  if (verifyContent(batchFile, checksumFile)) {
    await success(pendingFilenames, processedFilenames)
  } else {
    await failure(pendingFilenames, processedFilenames)
  }
}

module.exports = validate
