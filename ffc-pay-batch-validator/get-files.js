const retry = require('./retry')
const storage = require('./storage')

const getFiles = async (context, pendingFilenames) => {
  // ensure we also have a control file for checksum before continuing
  await retry(() => storage.getFile(context, pendingFilenames.checksumControlFilename))

  return Promise.all([
    retry(() => storage.getFile(context, pendingFilenames.checksumFilename)),
    retry(() => storage.getFile(context, pendingFilenames.batchFilename))
  ])
}

module.exports = getFiles
