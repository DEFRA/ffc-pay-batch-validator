jest.mock('../../app/event')
const mockEvent = require('../../app/event')
jest.mock('../../app/signalr')
const mockSignalR = require('../../app/signalr')
const processEvent = require('../../app/index')
const mockContext = require('../mock-context')

describe('index function', () => {
  const message = {
    name: 'test',
    properties: {
      id: '123456789',
      checkpoint: 'test',
      status: 'testing',
      action: {
        type: 'test',
        message: 'test',
        timestamp: new Date(),
        data: {}
      }
    }
  }

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('an error is thrown (and logged) when an error occurs', async () => {
    mockSignalR.sendMessage.mockImplementation(() => { throw new Error() })
    await processEvent(mockContext, message)
    expect(mockContext.log.error).toHaveBeenCalledTimes(1)
  })

  test('receives message from service bus and successfully calls save and send message', async () => {
    await processEvent(mockContext, message)
    expect(mockEvent.saveEvent).toHaveBeenCalledTimes(1)
    expect(mockSignalR.sendMessage).toHaveBeenCalledTimes(1)
    expect(mockContext.done.mock.calls.length).toEqual(1)
  })

  test('receives message from service bus with invalid id and does not calls save and send message', async () => {
    message.properties.id = 123456789
    await processEvent(mockContext, message)
    expect(mockEvent.saveEvent).toHaveBeenCalledTimes(0)
    expect(mockSignalR.sendMessage).toHaveBeenCalledTimes(0)
    expect(mockContext.done.mock.calls.length).toEqual(0)
  })
})
