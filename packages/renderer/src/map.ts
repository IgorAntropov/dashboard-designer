import * as echarts from 'echarts'

import { mapUrlFor } from './maps/scopes'
import { resolveRegions } from './series'
import type { RenderInput } from './types'

const MAX_GEOJSON_BYTES = 8 * 1024 * 1024
const MAX_CACHE_ENTRIES = 8

const geoCache = new Map<string, Promise<unknown>>()
const registered = new Set<string>()

export function mapNameForUrl(url: string): string {
  return `pk-map:${url}`
}

async function fetchGeoJson(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`map request failed: ${response.status}`)
  }
  const declared = response.headers.get('content-length')
  if (declared && Number(declared) > MAX_GEOJSON_BYTES) {
    throw new Error('map too large')
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  let done = false
  while (!done) {
    const result = await reader.read()
    done = result.done
    if (result.value) {
      total += result.value.byteLength
      if (total > MAX_GEOJSON_BYTES) {
        await reader.cancel()
        throw new Error('map too large')
      }
      chunks.push(result.value)
    }
  }

  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(merged))
}

function loadGeoJson(url: string): Promise<unknown> {
  let pending = geoCache.get(url)
  if (!pending) {
    pending = fetchGeoJson(url).catch((error) => {
      geoCache.delete(url)
      throw error
    })
    if (geoCache.size >= MAX_CACHE_ENTRIES) {
      const oldest = geoCache.keys().next().value
      if (oldest !== undefined) {
        geoCache.delete(oldest)
      }
    }
    geoCache.set(url, pending)
  }
  return pending
}

export async function ensureMap(config: Record<string, unknown>): Promise<string> {
  const url = mapUrlFor(config)
  const name = mapNameForUrl(url)
  if (registered.has(name)) {
    return name
  }
  const geoJson = await loadGeoJson(url)
  echarts.registerMap(name, geoJson as Parameters<typeof echarts.registerMap>[1])
  registered.add(name)
  return name
}

export function buildGeoOption(
  input: RenderInput,
  mapName: string,
): Record<string, unknown> {
  const regions = resolveRegions(input)
  const title = typeof input.config.title === 'string' ? input.config.title : ''
  const max = Math.max(1, ...regions.map((region) => region.value))

  return {
    backgroundColor: 'transparent',
    textStyle: {
      color: input.theme.colorText,
      fontFamily: input.theme.fontFamily,
    },
    title: title
      ? { text: title, textStyle: { color: input.theme.colorText, fontSize: 14 } }
      : undefined,
    tooltip: { trigger: 'item' },
    visualMap: {
      min: 0,
      max,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 4,
      itemWidth: 12,
      itemHeight: 90,
      inRange: { color: [input.theme.colorSurface, input.theme.colorAccent] },
      textStyle: { color: input.theme.colorMuted },
    },
    series: [
      {
        type: 'map',
        map: mapName,
        roam: true,
        scaleLimit: { min: 1, max: 12 },
        label: { show: false },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: input.theme.colorAccent },
        },
        itemStyle: {
          borderColor: input.theme.colorMuted,
          borderWidth: 0.4,
          areaColor: input.theme.colorSurface,
        },
        data: regions,
      },
    ],
  }
}
