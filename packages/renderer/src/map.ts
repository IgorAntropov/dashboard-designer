import * as echarts from 'echarts'

import { WORLD_MAP_NAME, WORLD_SVG } from './maps/world'
import { resolveRegions } from './series'
import type { RenderInput } from './types'

let registered = false

export function ensureWorldMap(): void {
  if (registered) {
    return
  }
  echarts.registerMap(WORLD_MAP_NAME, { svg: WORLD_SVG })
  registered = true
}

export function buildMapOption(input: RenderInput): Record<string, unknown> {
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
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 4,
      itemWidth: 12,
      itemHeight: 60,
      inRange: { color: [input.theme.colorSurface, input.theme.colorAccent] },
      textStyle: { color: input.theme.colorMuted },
    },
    series: [
      {
        type: 'map',
        map: WORLD_MAP_NAME,
        roam: false,
        label: { show: false },
        emphasis: {
          label: { show: false },
          itemStyle: { areaColor: input.theme.colorAccent },
        },
        itemStyle: {
          borderColor: input.theme.colorMuted,
          borderWidth: 0.5,
          areaColor: input.theme.colorSurface,
        },
        data: regions,
      },
    ],
  }
}
