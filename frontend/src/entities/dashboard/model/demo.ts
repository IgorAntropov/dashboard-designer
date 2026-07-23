import type { WidgetInstance } from '@entities/widget'
import { widgetTypeByKey } from '@entities/widget'

import type { Dashboard } from '../api/repository'

export const DEMO_DASHBOARD_ID = 'demo'
const DEMO_THEME = 'dark-pro'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function mk(
  type: string,
  box: { x: number; y: number; w: number; h: number },
  config: Record<string, unknown> = {},
): WidgetInstance {
  const def = widgetTypeByKey(type)
  return {
    id: `demo-${type}-${box.x}-${box.y}`,
    type,
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    config: { ...(def ? clone(def.defaultConfig) : {}), ...config },
    schema: def ? clone(def.defaultSchema) : {},
    binding: def ? clone(def.defaultBinding) : {},
  }
}

const REVENUE_SERIES = [
  { key: 'value', name: 'Выручка' },
  { key: 'value2', name: 'Прибыль' },
]

export function buildDemoWidgets(): WidgetInstance[] {
  return [
    mk('section', { x: 0, y: 0, w: 12, h: 1 }, {
      title: 'Ключевые показатели',
      subtitle: 'KPI, шкалы и прогресс',
    }),
    mk('stat-tile', { x: 0, y: 1, w: 3, h: 3 }, {
      title: 'Выручка',
      unit: '₽',
      period: 'за месяц',
      info: 'Сумма продаж за текущий месяц',
    }),
    mk('gauge', { x: 3, y: 1, w: 4, h: 4 }, {
      title: 'Загрузка мощностей',
      max: 100,
    }),
    mk('progress', { x: 7, y: 1, w: 5, h: 2 }, {
      title: 'Выполнение плана',
      max: 100,
    }),

    mk('section', { x: 0, y: 5, w: 12, h: 1 }, {
      title: 'Графики',
      subtitle: 'Линейные, столбчатые и круговые диаграммы',
    }),
    mk('bar-chart', { x: 0, y: 6, w: 6, h: 4 }, {
      title: 'Продажи по дням',
      series: REVENUE_SERIES,
    }),
    mk('line-chart', { x: 6, y: 6, w: 6, h: 4 }, {
      title: 'Динамика',
      series: REVENUE_SERIES,
    }),
    mk('area-chart', { x: 0, y: 10, w: 6, h: 4 }, { title: 'Трафик' }),
    mk('radar-chart', { x: 6, y: 10, w: 6, h: 4 }, { title: 'Оценка команды' }),
    mk('pie-chart', { x: 0, y: 14, w: 4, h: 4 }, { title: 'Доли рынка' }),
    mk('donut-chart', { x: 4, y: 14, w: 4, h: 4 }, { title: 'Каналы продаж' }),
    mk('scatter-chart', { x: 8, y: 14, w: 4, h: 4 }, { title: 'Корреляция' }),

    mk('section', { x: 0, y: 18, w: 12, h: 1 }, {
      title: 'География',
      subtitle: 'Карта и текстовый блок',
    }),
    mk('svg-map', { x: 0, y: 19, w: 7, h: 5 }, { title: 'Продажи по странам' }),
    mk('text-block', { x: 7, y: 19, w: 5, h: 3 }, {
      text: 'Это демо-дашборд: показаны все типы виджетов с примерными данными. Создайте свой дашборд, чтобы подставить настоящие данные и настроить внешний вид.',
    }),

    mk('section', { x: 0, y: 24, w: 12, h: 1 }, {
      title: 'Данные',
      subtitle: 'Таблица и рейтинг',
    }),
    mk('table', { x: 0, y: 25, w: 7, h: 4 }, {
      title: 'Показатели по регионам',
      columns: [
        { key: 'region', name: 'Регион', type: 'text' },
        { key: 'trips', name: 'Поездки, млн', type: 'number' },
        { key: 'delta', name: 'Δ %', type: 'number' },
      ],
    }),
    mk('ranking', { x: 7, y: 25, w: 5, h: 4 }, {
      title: 'Топ регионов',
      limit: 5,
      direction: 'top',
      unit: ' млн',
    }),
  ]
}

export function demoDashboard(title: string): Dashboard {
  const now = new Date().toISOString()
  return {
    id: DEMO_DASHBOARD_ID,
    title,
    slug: DEMO_DASHBOARD_ID,
    theme_key: DEMO_THEME,
    theme_tokens: null,
    layout: { widgets: buildDemoWidgets() },
    data_bindings: {},
    data_source: {},
    status: 'draft',
    created_at: now,
    updated_at: now,
  }
}
