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

export function trendLine(
  points: Array<[number, number]>,
): Array<[number, number]> {
  const n = points.length
  if (n < 2) {
    return []
  }
  let sx = 0
  let sy = 0
  let sxy = 0
  let sxx = 0
  for (const [x, y] of points) {
    sx += x
    sy += y
    sxy += x * y
    sxx += x * x
  }
  const denominator = n * sxx - sx * sx
  if (denominator === 0) {
    return []
  }
  const slope = (n * sxy - sx * sy) / denominator
  const intercept = (sy - slope * sx) / n
  const xs = points.map((point) => point[0])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  return [
    [minX, intercept + slope * minX],
    [maxX, intercept + slope * maxX],
  ]
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

  if (input.type === 'combo') {
    const categories = resolveCategories(input)
    const defs = seriesDefs(input)
    const palette = input.theme.colorSeries
    const decimals = decimalsOf(input)
    const axisLabel = {
      color: input.theme.colorMuted,
      formatter: (value: number) => formatKpiValue(Number(value), decimals),
    }
    const series = defs.map((def, index) => {
      const isLine = def.type === 'line'
      return {
        name: def.name,
        type: isLine ? 'line' : 'bar',
        yAxisIndex: isLine ? 1 : 0,
        data: valuesForKey(input, def.key),
        smooth: isLine,
        symbolSize: 7,
        lineStyle: isLine ? { width: 3 } : undefined,
        itemStyle: {
          color: palette[index % palette.length],
          borderRadius: isLine ? 0 : 4,
        },
        z: isLine ? 3 : 2,
      }
    })
    return {
      ...base,
      tooltip: { trigger: 'axis', valueFormatter: valueFormatter(input) },
      legend:
        defs.length > 1
          ? {
              data: defs.map((def) => def.name),
              bottom: 0,
              itemHeight: 10,
              textStyle: { color: input.theme.colorMuted },
            }
          : undefined,
      grid: {
        left: 52,
        right: 52,
        top: title ? 40 : 16,
        bottom: defs.length > 1 ? 58 : 28,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: input.theme.colorMuted },
      },
      yAxis: [
        { type: 'value', axisLabel },
        { type: 'value', axisLabel, splitLine: { show: false } },
      ],
      series,
    }
  }

  if (input.type === 'timeseries') {
    const dateKey = input.binding.label ?? 'date'
    const defs = seriesDefs(input)
    const palette = input.theme.colorSeries
    const decimals = decimalsOf(input)
    const series = defs.map((def, index) => ({
      name: def.name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: defs.length === 1 ? { opacity: 0.22 } : undefined,
      lineStyle: { width: 2, type: def.dashed ? 'dashed' : 'solid' },
      itemStyle: { color: palette[index % palette.length] },
      data: input.data.map((row) => [row[dateKey], Number(row[def.key] ?? 0)]),
    }))
    return {
      ...base,
      tooltip: { trigger: 'axis', valueFormatter: valueFormatter(input) },
      legend:
        defs.length > 1
          ? {
              data: defs.map((def) => def.name),
              bottom: 0,
              itemHeight: 10,
              textStyle: { color: input.theme.colorMuted },
            }
          : undefined,
      grid: {
        left: 52,
        right: 20,
        top: title ? 40 : 16,
        bottom: defs.length > 1 ? 58 : 28,
      },
      xAxis: { type: 'time', axisLabel: { color: input.theme.colorMuted } },
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

  if (input.type === 'scatter-trend') {
    const points = resolvePoints(input)
    const line = trendLine(points)
    return {
      ...base,
      tooltip: { trigger: 'item' },
      grid: { left: 44, right: 16, top: title ? 40 : 16, bottom: 28 },
      xAxis: { type: 'value', axisLabel: { color: input.theme.colorMuted } },
      yAxis: { type: 'value', axisLabel: { color: input.theme.colorMuted } },
      series: [
        {
          type: 'scatter',
          data: points,
          symbolSize: 11,
          itemStyle: { color: input.theme.colorAccent },
        },
        {
          type: 'line',
          data: line,
          showSymbol: false,
          silent: true,
          lineStyle: { type: 'dashed', width: 2, color: input.theme.colorMuted },
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
