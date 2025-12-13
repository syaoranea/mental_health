import { 
  getToggles, 
  getToggle, 
  isRegistroPrivadoHidden,
  clearCache,
  configureFeatureToggles,
  isCacheValid,
  getCacheSize
} from '../feature-toggles'

const mockDdbSend = jest.fn()

jest.mock('@/lib/dynamodb', () => ({
  ddb: {
    send: (...args) => mockDdbSend(...args)
  }
}))

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  GetCommand: jest.fn().mockImplementation((params) => ({ params }))
}))

describe('Feature Toggles Service', () => {
  beforeEach(() => {
    clearCache()
    mockDdbSend.mockReset()
    configureFeatureToggles({ ttlMs: 5 * 60 * 1000 })
  })

  describe('Cache Miss', () => {
    it('should fetch from DynamoDB when cache is empty', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: {
            registroPrivado: true,
            outroToggle: false
          }
        }
      })

      const toggles = await getToggles('meuRefugio')

      expect(mockDdbSend).toHaveBeenCalledTimes(1)
      expect(toggles).toEqual({
        registroPrivado: true,
        outroToggle: false
      })
    })

    it('should return empty object when no item found in DynamoDB', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: null
      })

      const toggles = await getToggles('meuRefugio')

      expect(mockDdbSend).toHaveBeenCalledTimes(1)
      expect(toggles).toEqual({})
    })

    it('should handle DynamoDB format with BOOL wrapper', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: {
            registroPrivado: { BOOL: true }
          }
        }
      })

      const toggles = await getToggles('meuRefugio')

      expect(toggles).toEqual({
        registroPrivado: true
      })
    })
  })

  describe('Cache Hit', () => {
    it('should return cached value without calling DynamoDB', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: {
            registroPrivado: true
          }
        }
      })

      await getToggles('meuRefugio')
      expect(mockDdbSend).toHaveBeenCalledTimes(1)

      const toggles = await getToggles('meuRefugio')
      expect(mockDdbSend).toHaveBeenCalledTimes(1)
      expect(toggles).toEqual({
        registroPrivado: true
      })
    })

    it('should cache different appIds separately', async () => {
      mockDdbSend
        .mockResolvedValueOnce({
          Item: { appId: 'app1', toggles: { toggle1: true } }
        })
        .mockResolvedValueOnce({
          Item: { appId: 'app2', toggles: { toggle2: false } }
        })

      const toggles1 = await getToggles('app1')
      const toggles2 = await getToggles('app2')

      expect(mockDdbSend).toHaveBeenCalledTimes(2)
      expect(toggles1).toEqual({ toggle1: true })
      expect(toggles2).toEqual({ toggle2: false })

      const cachedToggles1 = await getToggles('app1')
      const cachedToggles2 = await getToggles('app2')

      expect(mockDdbSend).toHaveBeenCalledTimes(2)
      expect(cachedToggles1).toEqual({ toggle1: true })
      expect(cachedToggles2).toEqual({ toggle2: false })
    })

    it('should validate cache correctly', async () => {
      expect(isCacheValid('meuRefugio')).toBe(false)

      mockDdbSend.mockResolvedValueOnce({
        Item: { appId: 'meuRefugio', toggles: { registroPrivado: true } }
      })

      await getToggles('meuRefugio')

      expect(isCacheValid('meuRefugio')).toBe(true)
      expect(getCacheSize()).toBe(1)
    })
  })

  describe('Cache Expiration (TTL)', () => {
    it('should fetch from DynamoDB after cache expires', async () => {
      configureFeatureToggles({ ttlMs: 100 })

      mockDdbSend
        .mockResolvedValueOnce({
          Item: { appId: 'meuRefugio', toggles: { registroPrivado: true } }
        })
        .mockResolvedValueOnce({
          Item: { appId: 'meuRefugio', toggles: { registroPrivado: false } }
        })

      const toggles1 = await getToggles('meuRefugio')
      expect(toggles1).toEqual({ registroPrivado: true })
      expect(mockDdbSend).toHaveBeenCalledTimes(1)

      await new Promise(resolve => setTimeout(resolve, 150))

      const toggles2 = await getToggles('meuRefugio')
      expect(toggles2).toEqual({ registroPrivado: false })
      expect(mockDdbSend).toHaveBeenCalledTimes(2)
    })
  })

  describe('Toggle Inexistente', () => {
    it('should return false for non-existent toggle', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: {
            outroToggle: true
          }
        }
      })

      const value = await getToggle('meuRefugio', 'registroPrivado')

      expect(value).toBe(false)
    })

    it('should return false when toggles object is empty', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: {}
        }
      })

      const value = await getToggle('meuRefugio', 'registroPrivado')

      expect(value).toBe(false)
    })

    it('should return false when item does not exist', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: null
      })

      const value = await getToggle('meuRefugio', 'registroPrivado')

      expect(value).toBe(false)
    })
  })

  describe('isRegistroPrivadoHidden', () => {
    it('should return true when registroPrivado toggle is true', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: { registroPrivado: true }
        }
      })

      const hidden = await isRegistroPrivadoHidden()

      expect(hidden).toBe(true)
    })

    it('should return false when registroPrivado toggle is false', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: { registroPrivado: false }
        }
      })

      const hidden = await isRegistroPrivadoHidden()

      expect(hidden).toBe(false)
    })

    it('should return false when registroPrivado toggle does not exist', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'meuRefugio',
          toggles: {}
        }
      })

      const hidden = await isRegistroPrivadoHidden()

      expect(hidden).toBe(false)
    })

    it('should use custom appId when provided', async () => {
      mockDdbSend.mockResolvedValueOnce({
        Item: {
          appId: 'customApp',
          toggles: { registroPrivado: true }
        }
      })

      const hidden = await isRegistroPrivadoHidden('customApp')

      expect(hidden).toBe(true)
    })
  })

  describe('clearCache', () => {
    it('should clear all cached entries', async () => {
      mockDdbSend.mockResolvedValue({
        Item: { appId: 'test', toggles: { test: true } }
      })

      await getToggles('app1')
      await getToggles('app2')

      expect(getCacheSize()).toBe(2)

      clearCache()

      expect(getCacheSize()).toBe(0)
      expect(isCacheValid('app1')).toBe(false)
      expect(isCacheValid('app2')).toBe(false)
    })
  })
})
