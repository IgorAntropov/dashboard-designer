import { describe, expect, it } from 'vitest'

import type { WidgetInstance } from '@entities/widget'

import { parseWidgetJson, widgetToJson } from './widgetJson'

const widget: WidgetInstance = {
  id: 'w1',
  type: 'bar-chart',
  x: 0,
  y: 0,
  w: 6,
  h: 4,
  config: { title: 'Sales' },
  schema: { value: { key: 'value', type: 'number', label: 'Value' } },
  binding: { value: 'amount' },
}

describe('widgetJson', () => {
  it('round-trips a widget through JSON', () => {
    const json = widgetToJson(widget)
    const result = parseWidgetJson(json)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.config).toEqual({ title: 'Sales' })
      expect(result.data.binding).toEqual({ value: 'amount' })
    }
  })

  it('rejects invalid JSON syntax', () => {
    const result = parseWidgetJson('{ not json')
    expect(result).toEqual({ ok: false, error: 'syntax' })
  })

  it('requires config to be an object', () => {
    const result = parseWidgetJson(
      JSON.stringify({ config: 5, schema: {}, binding: {} }),
    )
    expect(result).toEqual({ ok: false, error: 'config' })
  })

  it('rejects schema fields with an unknown type', () => {
    const result = parseWidgetJson(
      JSON.stringify({
        config: {},
        schema: { v: { key: 'v', type: 'weird' } },
        binding: {},
      }),
    )
    expect(result).toEqual({ ok: false, error: 'schema' })
  })

  it('rejects non-string binding values', () => {
    const result = parseWidgetJson(
      JSON.stringify({ config: {}, schema: {}, binding: { value: 3 } }),
    )
    expect(result).toEqual({ ok: false, error: 'binding' })
  })
})
