import { resolveSeries } from './series'
import type { RenderInput } from './types'

export function buildChartOption(input: RenderInput): Record<string, unknown> {
  const { categories, values } = resolveSeries(input)
  const title = typeof input.config.title === 'string' ? input.config.title : ''

  const base: Record<string, unknown> = {
    backgroundColor: 'transparent',
    textStyle: {
      color: input.theme.colorText,
      fontFamily: input.theme.fontFamily,
    },
    color: input.theme.colorSeries,
    title: title
      ? { text: title, textStyle: { color: input.theme.colorText, fontSize: 14 } }
      : undefined,
    tooltip: { trigger: input.type === 'pie-chart' ? 'item' : 'axis' },
  }

  if (input.type === 'pie-chart') {
    return {
      ...base,
      series: [
        {
          type: 'pie',
          radius: ['42%', '70%'],
          data: categories.map((name, index) => ({ name, value: values[index] })),
        },
      ],
    }
  }

  const isLine = input.type === 'line-chart'
  return {
    ...base,
    grid: { left: 44, right: 16, top: title ? 40 : 16, bottom: 28 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: input.theme.colorMuted },
    },
    yAxis: { type: 'value', axisLabel: { color: input.theme.colorMuted } },
    series: [
      {
        type: isLine ? 'line' : 'bar',
        data: values,
        smooth: isLine,
        itemStyle: { color: input.theme.colorAccent, borderRadius: isLine ? 0 : 4 },
        areaStyle: isLine ? { opacity: 0.15 } : undefined,
      },
    ],
  }
}
