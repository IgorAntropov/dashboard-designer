import { formatKpiValue } from './kpi'
import {
  resolveCategories,
  resolvePoints,
  resolveScalar,
  resolveSeries,
  seriesDefs,
  valuesForKey,
} from './series'
import type { RenderInput } from './types'

const PIE_TYPES = new Set(['pie-chart', 'donut-chart'])

function decimalsOf(input: RenderInput): number | undefined {
  return typeof input.config.decimals === 'number' ? input.config.decimals : undefined
}

function unitOf(input: RenderInput): string {
  return typeof input.config.unit === 'string' ? input.config.unit : ''
}

function valueFormatter(input: RenderInput): (value: number) => string {
  const decimals = decimalsOf(input)
  const unit = unitOf(input)
  return (value: number) =>
    `${formatKpiValue(Number(value), decimals)}${unit ? ` ${unit}` : ''}`
}

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
      tooltip: { trigger: 'item', valueFormatter: valueFormatter(input) },
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

  const categories = resolveCategories(input)
  const defs = seriesDefs(input)
  const baseType = input.type === 'bar-chart' ? 'bar' : 'line'
  const isArea = input.type === 'area-chart'
  const palette = input.theme.colorSeries
  const decimals = decimalsOf(input)

  const series = defs.map((def, index) => {
    const type = def.type ?? baseType
    const isLine = type === 'line'
    const color = palette[index % palette.length]
    return {
      name: def.name,
      type,
      data: valuesForKey(input, def.key),
      smooth: isLine,
      lineStyle: isLine
        ? { type: def.dashed ? 'dashed' : 'solid', width: 2 }
        : undefined,
      itemStyle: { color, borderRadius: type === 'bar' ? 4 : 0 },
      areaStyle: isLine && isArea ? { opacity: 0.3 } : undefined,
    }
  })

  const multi = defs.length > 1
  return {
    ...base,
    tooltip: { trigger: 'axis', valueFormatter: valueFormatter(input) },
    legend: multi
      ? {
          data: defs.map((def) => def.name),
          bottom: 0,
          itemHeight: 10,
          textStyle: { color: input.theme.colorMuted },
        }
      : undefined,
    grid: {
      left: 48,
      right: 16,
      top: title ? 40 : 16,
      bottom: multi ? 58 : 28,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: input.theme.colorMuted },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: input.theme.colorMuted,
        formatter: (value: number) => formatKpiValue(Number(value), decimals),
      },
    },
    series,
  }
}
