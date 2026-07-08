export function sampleDataFor(type: string): Array<Record<string, unknown>> {
  if (type === 'stat-tile') {
    return [{ label: 'Total', value: 1280 }]
  }
  if (type === 'gauge' || type === 'progress') {
    return [{ value: 68 }]
  }
  if (type === 'scatter-chart') {
    return [
      { x: 5, y: 12 },
      { x: 12, y: 8 },
      { x: 18, y: 22 },
      { x: 24, y: 15 },
      { x: 30, y: 27 },
      { x: 36, y: 19 },
    ]
  }
  if (type === 'svg-map') {
    return [
      { region: 'North America', value: 72 },
      { region: 'South America', value: 34 },
      { region: 'Europe', value: 88 },
      { region: 'Africa', value: 21 },
      { region: 'Asia', value: 95 },
      { region: 'Oceania', value: 18 },
    ]
  }
  if (type === 'text-block') {
    return []
  }
  return [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 7 },
    { label: 'Thu', value: 15 },
    { label: 'Fri', value: 22 },
  ]
}
