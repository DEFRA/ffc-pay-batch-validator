const retry = require('./retry')
const storage = require('./storage')
const { verifyContent } = require('./checksum')
const getFileNames = require('./filenames')

module.exports = async function (context, myBlob) {
  context.log('File received \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', myBlob.length, 'Bytes')
  const { controlFileName, batchFileName, checksumControlFileName, checksumFilename } = getFileNames(context.bindingData.blobTrigger)

  storage.connect(process.env.BATCH_STORAGE)

  const [checksumControlFile, checksumFile, batchFile] = await Promise.all([
    retry(() => storage.getChecksumFile(checksumControlFileName)),
    retry(() => storage.getChecksumFile(checksumFilename)),
    retry(() => storage.getChecksumFile(batchFileName))
  ])

  if (verifyContent(batchFile, checksumFile)) {
    console.log('Preparing files for processing')
    await storage.renameFile(controlFileName, controlFileName.replace('PENDING_', ''))
    await storage.renameFile(batchFileName, batchFileName.replace('PENDING_', ''))
    await storage.renameFile(checksumControlFileName, checksumControlFileName.replace('PENDING_', ''))
    await storage.renameFile(checksumFilename, checksumFilename.replace('PENDING_', ''))
    await storage.archiveFile(checksumControlFileName.replace('PENDING_', ''))
    await storage.archiveFile(checksumFilename.replace('PENDING_', ''))
    await storage.archiveFile(controlFileName.replace('PENDING_', ''))

    console.log('Files successfully processed')
  } else {
    console.log('Quarantining file')
    await storage.quarantineFile(controlFileName)
    await storage.quarantineFile(batchFileName)
    await storage.quarantineFile(checksumControlFileName)
    await storage.quarantineFile(checksumFilename)
  }
}
