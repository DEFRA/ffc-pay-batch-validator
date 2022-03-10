const { sendMessage } = require('../../app/signalr')
const mockContext = require('../mock-context')

describe('Signalr function', () => {
  const DEFAULT_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...DEFAULT_ENV }
  })

  afterEach(async () => {
    process.env = DEFAULT_ENV
    jest.resetAllMocks()
  })

  test('Send message to signalr binding called', async () => {
    process.env.USE_SIGNALR = true
    const message = {
      properties: {
        id: 123456789
      }
    }

    await sendMessage(mockContext, message)
    expect(mockContext.bindings).toHaveProperty('signalRMessages')
  })

  test('Set to not send signar message', async () => {
    process.env.USE_SIGNALR = false
    const message = {
      properties: {
        id: 123456789
      }
    }

    await sendMessage(mockContext, message)
    expect(mockContext.bindings).toHaveProperty('signalRMessages')
  })
})
