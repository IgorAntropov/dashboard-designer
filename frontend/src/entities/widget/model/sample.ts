type Translator = (key: string) => string

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const
const WEEKDAY_FALLBACK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function weekdays(t?: Translator): string[] {
  return WEEKDAY_KEYS.map((key, index) =>
    t ? t(`sample.${key}`) : WEEKDAY_FALLBACK[index],
  )
}

export function sampleDataFor(
  type: string,
  t?: Translator,
): Array<Record<string, unknown>> {
  if (type === 'stat-tile') {
    return [{ value: 1280, delta: 11.4 }]
  }
  if (type === 'gauge' || type === 'progress') {
    return [{ value: 68 }]
  }
  if (type === 'timeseries') {
    const start = Date.UTC(2024, 0, 1)
    const day = 86_400_000
    const values = [12, 18, 15, 22, 19, 27, 24, 31, 28, 35, 33, 40]
    return values.map((value, index) => ({
      date: new Date(start + index * 7 * day).toISOString().slice(0, 10),
      value,
    }))
  }
  if (type === 'scatter-chart' || type === 'scatter-trend') {
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
  if (type === 'ranking') {
    return [
      { label: 'Москва', value: 8.12, delta: 11.5 },
      { label: 'Краснодарский край', value: 6.74, delta: 16.1 },
      { label: 'Санкт-Петербург', value: 4.13, delta: 22.3 },
      { label: 'Московская область', value: 3.83, delta: 19.6 },
      { label: 'Татарстан', value: 1.7, delta: -3.7 },
    ]
  }
  if (type === 'table') {
    return [
      { region: 'Москва', trips: 8.12, delta: 11.5 },
      { region: 'Краснодарский край', trips: 6.74, delta: 16.1 },
      { region: 'Санкт-Петербург', trips: 4.13, delta: 22.3 },
      { region: 'Татарстан', trips: 1.7, delta: -3.7 },
    ]
  }
  if (type === 'text-block' || type === 'section') {
    return []
  }
  const values = [12, 19, 7, 15, 22]
  const values2 = [8, 14, 11, 9, 17]
  return weekdays(t).map((label, index) => ({
    label,
    value: values[index],
    value2: values2[index],
  }))
}
