const { BlobServiceClient } = require('@azure/storage-blob')
const containerName = 'batch'
const inboundFolder = 'inbound'
const archiveFolder = 'archive'
const quarantineFolder = 'quarantine'
let blobServiceClient
let container

const connect = (connectionStr) => {
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionStr)
  container = blobServiceClient.getContainerClient(containerName)
}

const getBlob = async (folder, filename) => {
  return container.getBlockBlobClient(`${folder}/${filename}`)
}

const getHashFile = async (filename) => {
  filename = sanitizeFilename(filename)
  console.log(`Searching for ${filename}`)
  const blob = await getBlob(inboundFolder, filename)
  const downloaded = await blob.downloadToBuffer()
  console.log(`Found ${filename}`)
  return downloaded.toString()
}

// Copies blob from one folder to another folder and deletes blob from original folder
const moveFile = async (sourceFolder, destinationFolder, sourceFilename, destinationFilename) => {
  const sourceBlob = await getBlob(sourceFolder, sourceFilename)
  const destinationBlob = await getBlob(destinationFolder, destinationFilename)
  const copyResult = await (await destinationBlob.beginCopyFromURL(sourceBlob.url)).pollUntilDone()

  if (copyResult.copyStatus === 'success') {
    await sourceBlob.delete()
  }
}

const archiveFile = async (filename) => {
  filename = sanitizeFilename(filename)
  return moveFile(inboundFolder, archiveFolder, filename, filename)
}

const quarantineFile = async (filename) => {
  filename = sanitizeFilename(filename)
  return moveFile(inboundFolder, quarantineFolder, filename, filename)
}

const renameFile = async (filename, targetFilename) => {
  filename = sanitizeFilename(filename)
  targetFilename = sanitizeFilename(targetFilename)
  return moveFile(inboundFolder, inboundFolder, filename, targetFilename)
}

const sanitizeFilename = (filename) => {
  return filename.replace(`${containerName}/${inboundFolder}/`, '')
}

module.exports = {
  connect,
  getHashFile,
  renameFile,
  archiveFile,
  quarantineFile
}
