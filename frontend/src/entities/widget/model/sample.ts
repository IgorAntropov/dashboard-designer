export function sampleDataFor(type: string): Array<Record<string, unknown>> {
  if (type === 'stat-tile') {
    return [{ value: 1280, delta: 11.4 }]
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
      { region: 'Russia', value: 90 },
      { region: 'China', value: 78 },
      { region: 'United States', value: 70 },
      { region: 'India', value: 55 },
      { region: 'Brazil', value: 40 },
      { region: 'Germany', value: 60 },
      { region: 'France', value: 52 },
      { region: 'Canada', value: 34 },
      { region: 'Australia', value: 28 },
      { region: 'Egypt', value: 22 },
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
