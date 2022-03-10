const { getPendingFilenames, getProcessedFilenames } = require('./filenames')
const validate = require('./validate')

module.exports = async function (context, myBlob) {
  context.log('File received \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', myBlob.length, 'Bytes')
  const pendingFilenames = getPendingFilenames(context.bindingData.blobTrigger)
  const processedFilenames = getProcessedFilenames(pendingFilenames)

  await validate(pendingFilenames, processedFilenames)
}
