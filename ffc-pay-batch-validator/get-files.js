const retry = require('./retry')
const storage = require('./storage')

const getFiles = async (pendingFilenames) => {
  // ensure we also have a control file for checksum before continuing
  await retry(() => storage.getChecksumFile(pendingFilenames.checksumControlFilename))

  return Promise.all([
    retry(() => storage.getChecksumFile(pendingFilenames.checksumFilename)),
    retry(() => storage.getChecksumFile(pendingFilenames.batchFilename))
  ])
}

module.exports = getFiles
