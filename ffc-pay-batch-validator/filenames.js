const getFileNames = (triggerFile) => {
  return {
    controlFileName: triggerFile,
    batchFileName: triggerFile.replace('CTL_', ''),
    checksumControlFileName: triggerFile.replace('.dat', '.txt'),
    checksumFilename: triggerFile.replace('CTL_', '').replace('.dat', '.txt')
  }
}

module.exports = getFileNames
