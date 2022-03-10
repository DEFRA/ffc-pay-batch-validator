const storage = require('../storage')
const { verifyContent } = require('../checksum')
const getFiles = require('../get-files')
const success = require('./success')
const failure = require('./failure')

const validate = async (context, pendingFilenames, processedFilenames) => {
  storage.connect(process.env.BATCH_STORAGE)
  const [checksumFile, batchFile] = await getFiles(context, pendingFilenames)

  if (verifyContent(batchFile, checksumFile)) {
    await success(context, pendingFilenames, processedFilenames)
  } else {
    await failure(context, pendingFilenames, processedFilenames)
  }
}

module.exports = validate
