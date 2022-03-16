const storage = require('../storage')

const success = async (context, pendingFilenames, processedFilenames) => {
  context.log('Renaming files')
  await storage.renameFile(pendingFilenames.controlFilename, processedFilenames.controlFilename)
  await storage.renameFile(pendingFilenames.batchFilename, processedFilenames.batchFilename)
  await storage.renameFile(pendingFilenames.checksumControlFilename, processedFilenames.checksumControlFilename)
  await storage.renameFile(pendingFilenames.checksumFilename, processedFilenames.checksumFilename)
  context.log('Archiving files')
  await storage.archiveFile(processedFilenames.checksumControlFilename)
  await storage.archiveFile(processedFilenames.checksumFilename)
  await storage.archiveFile(processedFilenames.controlFilename)
  context.log('Success')
}

module.exports = success
