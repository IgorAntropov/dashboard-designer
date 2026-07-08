import { resolvePoints, resolveScalar, resolveSeries } from './series'
import type { RenderInput } from './types'

const PIE_TYPES = new Set(['pie-chart', 'donut-chart'])
const CARTESIAN_TYPES = new Set(['bar-chart', 'line-chart', 'area-chart'])

function baseOption(input: RenderInput, title: string): Record<string, unknown> {
  return {
    backgroundColor: 'transparent',
    textStyle: {
      color: input.theme.colorText,
      fontFamily: input.theme.fontFamily,
    },
    color: input.theme.colorSeries,
    title: title
      ? { text: title, textStyle: { color: input.theme.colorText, fontSize: 14 } }
      : undefined,
  }
}

export function buildChartOption(input: RenderInput): Record<string, unknown> {
  const title = typeof input.config.title === 'string' ? input.config.title : ''
  const base = baseOption(input, title)

  if (PIE_TYPES.has(input.type)) {
    const { categories, values } = resolveSeries(input)
    const inner = input.type === 'donut-chart' ? '58%' : '42%'
    return {
      ...base,
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: [inner, '72%'],
          data: categories.map((name, index) => ({ name, value: values[index] })),
        },
      ],
    }
  }

  if (input.type === 'scatter-chart') {
    return {
      ...base,
      tooltip: { trigger: 'item' },
      grid: { left: 44, right: 16, top: title ? 40 : 16, bottom: 28 },
      xAxis: { type: 'value', axisLabel: { color: input.theme.colorMuted } },
      yAxis: { type: 'value', axisLabel: { color: input.theme.colorMuted } },
      series: [
        {
          type: 'scatter',
          data: resolvePoints(input),
          itemStyle: { color: input.theme.colorAccent },
        },
      ],
    }
  }

  if (input.type === 'radar-chart') {
    const { categories, values } = resolveSeries(input)
    const max = Math.max(1, ...values) * 1.2
    return {
      ...base,
      tooltip: { trigger: 'item' },
      radar: {
        indicator: categories.map((name) => ({ name, max })),
        axisName: { color: input.theme.colorMuted },
      },
      series: [
        {
          type: 'radar',
          data: [{ value: values }],
          areaStyle: { opacity: 0.2 },
          itemStyle: { color: input.theme.colorAccent },
        },
      ],
    }
  }

  if (input.type === 'gauge') {
    const max = typeof input.config.max === 'number' ? input.config.max : 100
    return {
      ...base,
      series: [
        {
          type: 'gauge',
          min: 0,
          max,
          progress: { show: true, roundCap: true, width: 10 },
          axisLine: { lineStyle: { width: 10 } },
          axisTick: { show: false },
          splitLine: { length: 8 },
          axisLabel: { color: input.theme.colorMuted, distance: 12 },
          detail: {
            valueAnimation: true,
            color: input.theme.colorText,
            fontSize: 20,
          },
          data: [{ value: resolveScalar(input) }],
        },
      ],
    }
  }

  const { categories, values } = resolveSeries(input)
  const isLine = input.type === 'line-chart' || input.type === 'area-chart'
  const isArea = input.type === 'area-chart'
  const cartesian = CARTESIAN_TYPES.has(input.type)
  return {
    ...base,
    tooltip: { trigger: 'axis' },
    grid: { left: 44, right: 16, top: title ? 40 : 16, bottom: 28 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: input.theme.colorMuted },
    },
    yAxis: { type: 'value', axisLabel: { color: input.theme.colorMuted } },
    series: [
      {
        type: cartesian && isLine ? 'line' : 'bar',
        data: values,
        smooth: isLine,
        itemStyle: {
          color: input.theme.colorAccent,
          borderRadius: isLine ? 0 : 4,
        },
        areaStyle: isArea ? { opacity: 0.35 } : isLine ? { opacity: 0.15 } : undefined,
      },
    ],
  }
}
