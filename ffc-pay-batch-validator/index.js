const retry = require('./retry')
const storage = require('./storage')
const { verifyContent } = require('./checksum')
const { getPendingFilenames, getProcessedFilenames } = require('./filenames')

module.exports = async function (context, myBlob) {
  context.log('File received \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', myBlob.length, 'Bytes')
  const pendingFilenames = getPendingFilenames(context.bindingData.blobTrigger)
  const processedFilenames = getProcessedFilenames(pendingFilenames)

  storage.connect(process.env.BATCH_STORAGE)

  const [checksumControlFile, checksumFile, batchFile] = await Promise.all([
    retry(() => storage.getChecksumFile(pendingFilenames.checksumControlFilename)),
    retry(() => storage.getChecksumFile(pendingFilenames.checksumFilename)),
    retry(() => storage.getChecksumFile(pendingFilenames.batchFilename))
  ])

  if (verifyContent(batchFile, checksumFile)) {
    console.log('Preparing files for processing')
    await storage.renameFile(pendingFilenames.controlFilename, processedFilenames.controlFilename)
    await storage.renameFile(pendingFilenames.batchFilename, processedFilenames.batchFilename)
    await storage.renameFile(pendingFilenames.checksumControlFilename, processedFilenames.checksumControlFilename)
    await storage.renameFile(pendingFilenames.checksumFilename, processedFilenames.checksumFilename)
    console.log('Renamed files')
    await storage.archiveFile(processedFilenames.checksumControlFilename)
    await storage.archiveFile(processedFilenames.checksumFilename)
    await storage.archiveFile(processedFilenames.controlFilename)
    console.log('Files successfully processed')
  } else {
    console.log('Quarantining file')
    await storage.quarantineFile(pendingFilenames.controlFilename)
    await storage.quarantineFile(pendingFilenames.batchFilename)
    await storage.quarantineFile(pendingFilenames.checksumControlFilename)
    await storage.quarantineFile(pendingFilenames.checksumFilename)
  }
}
