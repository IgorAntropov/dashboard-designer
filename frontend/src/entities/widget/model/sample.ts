export function sampleDataFor(type: string): Array<Record<string, unknown>> {
  if (type === 'stat-tile') {
    return [{ label: 'Total', value: 1280 }]
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
