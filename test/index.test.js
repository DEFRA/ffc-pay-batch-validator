const crypto = require('crypto')
jest.mock('../ffc-pay-batch-validator/config', () => ({ totalRetries: 1 }))
const validate = require('../ffc-pay-batch-validator')
const mockContext = require('./mock-context')
jest.mock('../ffc-pay-batch-validator/storage')
const mockStorage = require('../ffc-pay-batch-validator/storage')
const blob = ''
const BATCH_FILE_NAME = 'batch/inbound/PENDING_TEST_BATCH.dat'
const CTL_BATCH_FILE_NAME = 'batch/inbound/CTL_PENDING_TEST_BATCH.dat'
const CHECKSUM_FILE_NAME = 'batch/inbound/PENDING_TEST_BATCH.txt'

describe('validation', () => {
  const createHash = (content) => {
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  const setupFileContent = (isValid) => {
    mockStorage.getFile.mockImplementation((context, filename) => {
      switch (filename) {
        case BATCH_FILE_NAME:
          return isValid ? 'valid content' : 'invalid content'
        case CHECKSUM_FILE_NAME:
          return createHash('valid content')
        default:
          return ''
      }
    })
  }

  beforeEach(() => {
    mockContext.bindingData.blobTrigger = CTL_BATCH_FILE_NAME
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should rename all files on success', async () => {
    setupFileContent(true)
    await validate(mockContext, blob)
    expect(mockStorage.renameFile).toHaveBeenCalledWith('batch/inbound/PENDING_TEST_BATCH.dat', 'batch/inbound/TEST_BATCH.dat')
    expect(mockStorage.renameFile).toHaveBeenCalledWith('batch/inbound/CTL_PENDING_TEST_BATCH.dat', 'batch/inbound/CTL_TEST_BATCH.dat')
    expect(mockStorage.renameFile).toHaveBeenCalledWith('batch/inbound/CTL_PENDING_TEST_BATCH.txt', 'batch/inbound/CTL_TEST_BATCH.txt')
    expect(mockStorage.renameFile).toHaveBeenCalledWith('batch/inbound/PENDING_TEST_BATCH.txt', 'batch/inbound/TEST_BATCH.txt')
  })

  test('should archive control files and checksum on success', async () => {
    setupFileContent(true)
    await validate(mockContext, blob)
    expect(mockStorage.archiveFile).toHaveBeenCalledWith('batch/inbound/CTL_TEST_BATCH.dat')
    expect(mockStorage.archiveFile).toHaveBeenCalledWith('batch/inbound/CTL_TEST_BATCH.txt')
    expect(mockStorage.archiveFile).toHaveBeenCalledWith('batch/inbound/TEST_BATCH.txt')
  })

  test('should quarantine all files on failure', async () => {
    setupFileContent(false)
    await validate(mockContext, blob)
    expect(mockStorage.quarantineFile).toHaveBeenCalledWith('batch/inbound/CTL_PENDING_TEST_BATCH.dat')
    expect(mockStorage.quarantineFile).toHaveBeenCalledWith('batch/inbound/PENDING_TEST_BATCH.dat')
    expect(mockStorage.quarantineFile).toHaveBeenCalledWith('batch/inbound/CTL_PENDING_TEST_BATCH.txt')
    expect(mockStorage.quarantineFile).toHaveBeenCalledWith('batch/inbound/PENDING_TEST_BATCH.txt')
  })

  test('should throw error if file missing', async () => {
    mockStorage.getFile.mockImplementation(() => { throw new Error() })
    await expect(validate(mockContext, blob)).rejects.toThrow()
  })
})
