const { checkCreateProjection } = require('../../app/projection')
const mockContext = require('../mock-context')

describe('Projection function', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('No projection to be sent to outputSbTopic and outputSbTopic binding not called', async () => {
    const message = {
      id: '123456789',
      action: {
        type: 'create'
      }
    }

    const checkProjection = checkCreateProjection(mockContext, message)
    expect(checkProjection).toEqual(false)
    expect(mockContext.bindings).not.toHaveProperty('outputSbTopic')
  })

  test('Send a projection to outputSbTopic and outputSbTopic binding called', async () => {
    const message = {
      id: '123456789',
      action: {
        type: 'submission'
      }
    }

    const checkProjection = checkCreateProjection(mockContext, message)
    expect(checkProjection).toEqual(true)
    expect(mockContext.bindings).toHaveProperty('outputSbTopic')
  })
})
