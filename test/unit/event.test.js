jest.mock('../../app/projection')
const mockProjection = require('../../app/projection')
jest.mock('../../app/storage')
const mockStorage = require('../../app/storage')
const { saveEvent } = require('../../app/event')
const mockContext = require('../mock-context')

describe('Event function', () => {
  const message = {
    properties: {
      id: '123456789',
      status: 'in progress',
      action: {
        timestamp: new Date(),
        type: 'event'
      }
    }
  }

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('Save an event with no projection created', async () => {
    mockStorage.queryEntities.mockResolvedValue([])
    mockProjection.checkCreateProjection.mockResolvedValue(false)

    await saveEvent(mockContext, message)
    expect(mockProjection.checkCreateProjection).toHaveBeenCalledTimes(1)
    expect(mockStorage.queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
    expect(mockContext.bindings.tableBinding[0].CreateProjection).toEqual(false)
  })

  test('Duplicated event found created', async () => {
    mockStorage.queryEntities.mockResolvedValue([{ test: 'test' }])
    mockProjection.checkCreateProjection.mockResolvedValue(false)

    await saveEvent(mockContext, message)
    expect(mockProjection.checkCreateProjection).toHaveBeenCalledTimes(1)
    expect(mockStorage.queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
    expect(mockContext.bindings.tableBinding[0].Status).toEqual('duplicate event')
  })

  test('Save an event with a projection created', async () => {
    mockStorage.queryEntities.mockResolvedValue([])
    mockProjection.checkCreateProjection.mockResolvedValue(true)
    await saveEvent(mockContext, message)
    expect(mockProjection.checkCreateProjection).toHaveBeenCalledTimes(1)
    expect(mockStorage.queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
    expect(mockContext.bindings.tableBinding[0].CreateProjection).toEqual(true)
  })
})
