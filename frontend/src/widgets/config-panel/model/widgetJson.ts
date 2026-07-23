import type { SchemaField, WidgetInstance } from '@entities/widget'

const FIELD_TYPES = new Set<SchemaField['type']>([
  'string',
  'number',
  'boolean',
  'date',
])

export interface WidgetData {
  config: Record<string, unknown>
  schema: WidgetInstance['schema']
  binding: WidgetInstance['binding']
}

export type ParseResult =
  | { ok: true; data: WidgetData }
  | { ok: false; error: string }

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value)
  )
}

export function widgetToJson(widget: WidgetInstance): string {
  return JSON.stringify(
    {
      config: widget.config,
      schema: widget.schema,
      binding: widget.binding,
    },
    null,
    2,
  )
}

export function parseWidgetJson(raw: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'syntax' }
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, error: 'root' }
  }
  const { config, schema, binding } = parsed as Record<string, unknown>

  if (!isPlainObject(config)) {
    return { ok: false, error: 'config' }
  }
  if (!isPlainObject(schema)) {
    return { ok: false, error: 'schema' }
  }
  if (!isPlainObject(binding)) {
    return { ok: false, error: 'binding' }
  }

  for (const [key, field] of Object.entries(schema)) {
    if (!isPlainObject(field)) {
      return { ok: false, error: 'schema' }
    }
    if (typeof field.key !== 'string') {
      return { ok: false, error: 'schema' }
    }
    if (!FIELD_TYPES.has(field.type as SchemaField['type'])) {
      return { ok: false, error: 'schema' }
    }
    void key
  }

  for (const value of Object.values(binding)) {
    if (typeof value !== 'string') {
      return { ok: false, error: 'binding' }
    }
  }

  return {
    ok: true,
    data: {
      config: config as Record<string, unknown>,
      schema: schema as WidgetInstance['schema'],
      binding: binding as WidgetInstance['binding'],
    },
  }
}
