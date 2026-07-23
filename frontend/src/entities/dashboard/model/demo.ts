import type { WidgetInstance } from '@entities/widget'
import { widgetTypeByKey } from '@entities/widget'

import type { Dashboard } from '../api/repository'

export const DEMO_DASHBOARD_ID = 'demo'
const DEMO_THEME = 'dark-pro'

type Row = Record<string, unknown>

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function icon(bg: string, ch: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">` +
    `<rect width="40" height="40" rx="9" fill="${bg}"/>` +
    `<text x="20" y="27" font-size="20" text-anchor="middle" ` +
    `fill="#fff" font-family="sans-serif">${ch}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function mk(
  type: string,
  box: { x: number; y: number; w: number; h: number },
  config: Record<string, unknown> = {},
  data?: Row[],
): WidgetInstance {
  const def = widgetTypeByKey(type)
  const merged: Record<string, unknown> = {
    ...(def ? clone(def.defaultConfig) : {}),
    ...config,
  }
  if (data) {
    merged.sampleData = data
  }
  return {
    id: `demo-${type}-${box.x}-${box.y}`,
    type,
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    config: merged,
    schema: def ? clone(def.defaultSchema) : {},
    binding: def ? clone(def.defaultBinding) : {},
  }
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']
const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function weeklyDates(count: number): string[] {
  const start = Date.UTC(2024, 0, 1)
  const day = 86_400_000
  return Array.from({ length: count }, (_, i) =>
    new Date(start + i * 7 * day).toISOString().slice(0, 10),
  )
}

export function buildDemoWidgets(): WidgetInstance[] {
  const dates = weeklyDates(12)
  const orders = [420, 510, 480, 560, 590, 640, 610, 700, 680, 760, 810, 880]

  return [
    mk('section', { x: 0, y: 0, w: 12, h: 1 }, {
      title: 'Аналитика интернет-магазина',
      subtitle: 'Демо: все типы виджетов на едином наборе данных',
    }),

    mk(
      'stat-tile',
      { x: 0, y: 1, w: 3, h: 3 },
      {
        title: 'Выручка',
        unit: '₽',
        period: 'за месяц',
        info: 'Валовая выручка за текущий месяц',
        target: 5_000_000,
        decimals: 0,
      },
      [{ value: 4_823_500, delta: 12.7 }],
    ),
    mk(
      'stat-tile',
      { x: 3, y: 1, w: 3, h: 2 },
      { title: 'Средний чек', unit: '₽', period: 'за месяц', decimals: 0 },
      [{ value: 3240, delta: -2.4 }],
    ),
    mk(
      'gauge',
      { x: 6, y: 1, w: 3, h: 3 },
      { title: 'Загрузка склада', max: 100 },
      [{ value: 74 }],
    ),
    mk(
      'progress',
      { x: 9, y: 1, w: 3, h: 2 },
      { title: 'Выполнение плана продаж', max: 100 },
      [{ value: 82 }],
    ),

    mk('section', { x: 0, y: 4, w: 12, h: 1 }, {
      title: 'Динамика',
      subtitle: 'Комбо-график, временной ряд и классические диаграммы',
    }),
    mk(
      'combo',
      { x: 0, y: 5, w: 6, h: 4 },
      {
        title: 'Выручка и маржа',
        info: 'Левая ось — выручка (млн ₽), правая — маржа (%)',
        decimals: 1,
        series: [
          { key: 'revenue', name: 'Выручка, млн ₽', type: 'bar' },
          { key: 'margin', name: 'Маржа, %', type: 'line' },
        ],
      },
      MONTHS.map((label, i) => ({
        label,
        revenue: [3.1, 3.6, 4.2, 3.9, 4.8, 5.3][i],
        margin: [24, 26, 29, 27, 31, 33][i],
      })),
    ),
    mk(
      'timeseries',
      { x: 6, y: 5, w: 6, h: 4 },
      {
        title: 'Заказы по неделям',
        info: 'Динамика за 12 недель',
        decimals: 0,
      },
      dates.map((date, i) => ({ date, value: orders[i] })),
    ),
    mk(
      'bar-chart',
      { x: 0, y: 9, w: 6, h: 4 },
      {
        title: 'Выручка и прибыль по месяцам',
        info: 'Данные за первое полугодие',
        unit: ' млн ₽',
        decimals: 1,
        series: [
          { key: 'revenue', name: 'Выручка' },
          { key: 'profit', name: 'Прибыль' },
        ],
      },
      MONTHS.map((label, i) => ({
        label,
        revenue: [3.1, 3.6, 4.2, 3.9, 4.8, 5.3][i],
        profit: [0.8, 1.0, 1.3, 1.1, 1.6, 1.9][i],
      })),
    ),
    mk(
      'line-chart',
      { x: 6, y: 9, w: 6, h: 4 },
      {
        title: 'Трафик по дням недели',
        unit: ' тыс',
        decimals: 1,
        series: [
          { key: 'desktop', name: 'Десктоп' },
          { key: 'mobile', name: 'Мобайл', dashed: true },
        ],
      },
      WEEK.map((label, i) => ({
        label,
        desktop: [8.2, 7.9, 9.1, 8.7, 10.4, 6.3, 5.1][i],
        mobile: [11.5, 12.1, 13.4, 12.8, 15.2, 9.6, 8.3][i],
      })),
    ),
    mk(
      'area-chart',
      { x: 0, y: 13, w: 6, h: 4 },
      { title: 'Новые пользователи', decimals: 0 },
      MONTHS.map((label, i) => ({
        label,
        value: [1200, 1450, 1610, 1580, 1890, 2140][i],
      })),
    ),
    mk(
      'radar-chart',
      { x: 6, y: 13, w: 6, h: 4 },
      { title: 'Оценка команды (0–10)' },
      [
        { label: 'Скорость', value: 8 },
        { label: 'Качество', value: 9 },
        { label: 'Коммуникация', value: 7 },
        { label: 'Сроки', value: 6 },
        { label: 'Бюджет', value: 8 },
      ],
    ),

    mk('section', { x: 0, y: 17, w: 12, h: 1 }, {
      title: 'Структура и корреляция',
      subtitle: 'Круговые диаграммы и точечные графики',
    }),
    mk(
      'pie-chart',
      { x: 0, y: 18, w: 3, h: 4 },
      { title: 'Источники трафика', unit: '%' },
      [
        { label: 'Поиск', value: 42 },
        { label: 'Реклама', value: 27 },
        { label: 'Соцсети', value: 18 },
        { label: 'Email', value: 8 },
        { label: 'Прямые', value: 5 },
      ],
    ),
    mk(
      'donut-chart',
      { x: 3, y: 18, w: 3, h: 4 },
      { title: 'Устройства', unit: '%' },
      [
        { label: 'Десктоп', value: 46 },
        { label: 'Мобайл', value: 44 },
        { label: 'Планшет', value: 10 },
      ],
    ),
    mk(
      'scatter-chart',
      { x: 6, y: 18, w: 3, h: 4 },
      { title: 'Возраст и средний чек' },
      [
        { x: 19, y: 1900 },
        { x: 24, y: 2600 },
        { x: 28, y: 3100 },
        { x: 33, y: 4200 },
        { x: 37, y: 3800 },
        { x: 42, y: 5200 },
        { x: 48, y: 4600 },
        { x: 55, y: 6100 },
      ],
    ),
    mk(
      'scatter-trend',
      { x: 9, y: 18, w: 3, h: 4 },
      { title: 'Цена и продажи', info: 'Штриховая линия — линейный тренд' },
      [
        { x: 490, y: 320 },
        { x: 790, y: 260 },
        { x: 1190, y: 210 },
        { x: 1590, y: 175 },
        { x: 1990, y: 140 },
        { x: 2490, y: 95 },
        { x: 2990, y: 70 },
        { x: 3990, y: 42 },
      ],
    ),

    mk('section', { x: 0, y: 22, w: 12, h: 1 }, {
      title: 'География и текст',
      subtitle: 'Карта и текстовый блок',
    }),
    mk(
      'svg-map',
      { x: 0, y: 23, w: 7, h: 5 },
      { title: 'Выручка по странам' },
      [
        { region: 'Russia', value: 100 },
        { region: 'Kazakhstan', value: 38 },
        { region: 'Belarus', value: 31 },
        { region: 'Germany', value: 64 },
        { region: 'France', value: 52 },
        { region: 'United States', value: 88 },
        { region: 'China', value: 76 },
        { region: 'India', value: 47 },
        { region: 'Brazil', value: 35 },
        { region: 'Turkey', value: 29 },
      ],
    ),
    mk(
      'text-block',
      { x: 7, y: 23, w: 5, h: 5 },
      {
        text: 'Это демо-дашборд: один согласованный набор данных показан во всех виджетах — от KPI и графиков до карты, таблиц и рейтингов. У большинства виджетов можно включить иконку-подсказку (ℹ) и задать текст, разные единицы и форматы (₽, %, млн, тыс), а в таблицу добавить колонку с датами и картинками. Создайте свой дашборд, чтобы подставить настоящие данные.',
      },
    ),

    mk('section', { x: 0, y: 28, w: 12, h: 1 }, {
      title: 'Данные и товары',
      subtitle: 'Таблицы, изображения и рейтинги',
    }),
    mk(
      'table',
      { x: 0, y: 29, w: 6, h: 4 },
      {
        title: 'Заказы по регионам',
        info: 'Топ-5 регионов по выручке',
        columns: [
          { key: 'region', name: 'Регион', type: 'text' },
          { key: 'orders', name: 'Заказы', type: 'number' },
          { key: 'revenue', name: 'Выручка, ₽', type: 'number' },
          { key: 'delta', name: 'Δ %', type: 'number' },
        ],
      },
      [
        { region: 'Москва', orders: 4210, revenue: 13_640_000, delta: 11.5 },
        { region: 'Санкт-Петербург', orders: 2870, revenue: 8_930_000, delta: 22.3 },
        { region: 'Краснодарский край', orders: 1640, revenue: 4_510_000, delta: 16.1 },
        { region: 'Татарстан', orders: 980, revenue: 2_720_000, delta: -3.7 },
        { region: 'Свердловская обл.', orders: 760, revenue: 2_050_000, delta: 5.2 },
      ],
    ),
    mk(
      'table',
      { x: 6, y: 29, w: 6, h: 4 },
      {
        title: 'Последние поступления',
        columns: [
          { key: 'icon', name: '', type: 'image' },
          { key: 'name', name: 'Товар', type: 'text' },
          { key: 'date', name: 'Поступление', type: 'text' },
          { key: 'qty', name: 'Кол-во', type: 'number' },
          { key: 'price', name: 'Цена, ₽', type: 'number' },
        ],
      },
      [
        { icon: icon('#f5b301', '👟'), name: 'Кроссовки Runner Pro', date: '12 июн', qty: 320, price: 6990 },
        { icon: icon('#2f80ed', '🎒'), name: 'Рюкзак City 25L', date: '11 июн', qty: 210, price: 4290 },
        { icon: icon('#9b51e0', '🎧'), name: 'Наушники SoundX', date: '10 июн', qty: 180, price: 8990 },
        { icon: icon('#27ae60', '⌚'), name: 'Часы Fit Band 3', date: '09 июн', qty: 140, price: 5490 },
        { icon: icon('#eb5757', '🧥'), name: 'Куртка Alpine', date: '08 июн', qty: 95, price: 12990 },
      ],
    ),
    mk(
      'ranking',
      { x: 0, y: 33, w: 6, h: 4 },
      { title: 'Топ товаров', limit: 6, direction: 'top', unit: ' шт' },
      [
        { label: 'Кроссовки Runner Pro', value: 1240, delta: 18.2 },
        { label: 'Рюкзак City 25L', value: 980, delta: 9.4 },
        { label: 'Наушники SoundX', value: 870, delta: 24.1 },
        { label: 'Термокружка 0.5', value: 640, delta: -4.8 },
        { label: 'Куртка Alpine', value: 510, delta: 6.7 },
        { label: 'Часы Fit Band 3', value: 430, delta: 31.5 },
      ],
    ),
    mk(
      'ranking',
      { x: 6, y: 33, w: 6, h: 4 },
      { title: 'Аутсайдеры недели', limit: 5, direction: 'bottom', unit: ' шт' },
      [
        { label: 'Чехол Basic', value: 42, delta: -21.3 },
        { label: 'Брелок Logo', value: 55, delta: -12.7 },
        { label: 'Стикеры Pack', value: 61, delta: -8.1 },
        { label: 'Шнурки Neon', value: 74, delta: -3.4 },
        { label: 'Открытка Set', value: 88, delta: 1.2 },
      ],
    ),
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
