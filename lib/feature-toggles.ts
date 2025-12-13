import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { ddb } from '@/lib/dynamodb'

const TABLE_NAME = 'FeatureToggles'
const DEFAULT_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  toggles: Record<string, boolean>
  expiresAt: number
}

interface FeatureToggleConfig {
  ttlMs?: number
}

const cache = new Map<string, CacheEntry>()

let configuredTtlMs = DEFAULT_TTL_MS

export function configureFeatureToggles(config: FeatureToggleConfig): void {
  if (config.ttlMs !== undefined) {
    configuredTtlMs = config.ttlMs
  }
}

export function clearCache(): void {
  cache.clear()
}

export function getCacheSize(): number {
  return cache.size
}

export function isCacheValid(appId: string): boolean {
  const entry = cache.get(appId)
  if (!entry) return false
  return Date.now() < entry.expiresAt
}

async function fetchTogglesFromDynamoDB(appId: string): Promise<Record<string, boolean>> {
  console.log(`[feature-toggles] Fetching toggles from DynamoDB for appId: ${appId}`)
  
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { appId },
    })
  )

  if (!result.Item) {
    console.log(`[feature-toggles] No toggles found for appId: ${appId}`)
    return {}
  }

  const toggles = result.Item.toggles || {}
  console.log(`[feature-toggles] Toggles fetched:`, toggles)
  
  const normalizedToggles: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(toggles)) {
    if (typeof value === 'boolean') {
      normalizedToggles[key] = value
    } else if (typeof value === 'object' && value !== null && 'BOOL' in value) {
      normalizedToggles[key] = (value as { BOOL: boolean }).BOOL
    }
  }
  
  return normalizedToggles
}

export async function getToggles(appId: string): Promise<Record<string, boolean>> {
  const cachedEntry = cache.get(appId)
  
  if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
    console.log(`[feature-toggles] Cache hit for appId: ${appId}`)
    return cachedEntry.toggles
  }

  console.log(`[feature-toggles] Cache miss for appId: ${appId}`)
  
  const toggles = await fetchTogglesFromDynamoDB(appId)
  
  cache.set(appId, {
    toggles,
    expiresAt: Date.now() + configuredTtlMs,
  })

  return toggles
}

export async function getToggle(appId: string, toggleName: string): Promise<boolean> {
  const toggles = await getToggles(appId)
  return toggles[toggleName] ?? false
}

export async function isRegistroPrivadoHidden(appId: string = 'meuRefugio'): Promise<boolean> {
  return getToggle(appId, 'registroPrivado')
}
