const retry = require('./retry')
const storage = require('./storage')
const { compareHash } = require('./checksum')

module.exports = async function (context, myBlob) {
  context.log('File received \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', myBlob.length, 'Bytes')
  const file = context.bindingData.blobTrigger
  storage.connect(process.env.BATCH_STORAGE)
  const hashFilename = file.replace('.dat', '.txt')
  const hash = await retry(() => storage.getHashFile(hashFilename))
  if (compareHash(myBlob.toString(), hash)) {
    console.log('File hash successfully validated')
    await storage.renameFile(file, file.replace('PENDING_', ''))
    await storage.archiveFile(hashFilename)
  } else {
    console.log('File hash validation failed')
    await storage.quarantineFile(file)
    await storage.quarantineFile(hashFilename)
  }
}
