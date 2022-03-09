const retry = require('./retry')
const storage = require('./storage')
const { verifyContent } = require('./checksum')

module.exports = async function (context, myBlob) {
  context.log('File received \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', myBlob.length, 'Bytes')
  const file = context.bindingData.blobTrigger
  storage.connect(process.env.BATCH_STORAGE)
  const hashFilename = file.replace('.dat', '.txt')
  const hash = await retry(() => storage.getHashFile(hashFilename))
  if (verifyContent(myBlob.toString(), hash)) {
    console.log('Preparing file for processing')
    await storage.renameFile(file, file.replace('PENDING_', ''))
    await storage.archiveFile(hashFilename)
    console.log('File successfully processed')
  } else {
    console.log('Quarantining file')
    await storage.quarantineFile(file)
    await storage.quarantineFile(hashFilename)
  }
}
