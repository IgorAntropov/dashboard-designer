export interface MapScope {
  key: string
  url: string
}

export const MAP_SCOPES: Record<string, MapScope> = {
  world: {
    key: 'world',
    url: 'https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/json/world.json',
  },
}

export const DEFAULT_MAP_SCOPE = 'world'

export function scopeKeyOf(config: Record<string, unknown>): string {
  const key = config.map
  return typeof key === 'string' && key ? key : DEFAULT_MAP_SCOPE
}

export function mapUrlFor(config: Record<string, unknown>): string {
  const custom = config.mapUrl
  if (typeof custom === 'string' && custom.trim()) {
    return custom.trim()
  }
  const scope = MAP_SCOPES[scopeKeyOf(config)]
  return scope ? scope.url : MAP_SCOPES[DEFAULT_MAP_SCOPE].url
}
