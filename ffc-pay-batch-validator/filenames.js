const getPendingFilenames = (triggerFile) => {
  return {
    controlFilename: triggerFile,
    batchFilename: triggerFile.replace('CTL_', ''),
    checksumControlFilename: triggerFile.replace('.dat', '.txt'),
    checksumFilename: triggerFile.replace('CTL_', '').replace('.dat', '.txt')
  }
}

const getProcessedFilenames = (pendingFilenames) => {
  return {
    controlFilename: pendingFilenames.controlFilename.replace('PENDING_', ''),
    batchFilename: pendingFilenames.batchFilename.replace('PENDING_', ''),
    checksumControlFilename: pendingFilenames.checksumControlFilename.replace('PENDING_', ''),
    checksumFilename: pendingFilenames.checksumFilename.replace('PENDING_', '')
  }
}

module.exports = {
  getPendingFilenames,
  getProcessedFilenames
}
