const retry = require('./retry')
const storage = require('./storage')
const { verifyContent } = require('./checksum')

module.exports = async function (context, myBlob) {
  context.log('File received \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', myBlob.length, 'Bytes')
  const file = context.bindingData.blobTrigger
  storage.connect(process.env.BATCH_STORAGE)
  const checksumFilename = file.replace('.dat', '.txt')
  const checksum = await retry(() => storage.getChecksumFile(checksumFilename))
  if (verifyContent(myBlob.toString(), checksum)) {
    console.log('Preparing file for processing')
    await storage.renameFile(file, file.replace('PENDING_', ''))
    await storage.archiveFile(checksumFilename)
    console.log('File successfully processed')
  } else {
    console.log('Quarantining file')
    await storage.quarantineFile(file)
    await storage.quarantineFile(checksumFilename)
  }
}
