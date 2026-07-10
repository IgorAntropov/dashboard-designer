<script setup lang="ts">
defineProps<{ type: string }>()
</script>

<template>
  <svg
    class="widget-glyph"
    viewBox="0 0 40 28"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="type === 'bar-chart'">
      <rect x="5" y="14" width="5" height="10" rx="1" fill="var(--pk-accent)" stroke="none" />
      <rect x="13" y="8" width="5" height="16" rx="1" fill="var(--pk-accent)" stroke="none" />
      <rect x="21" y="17" width="5" height="7" rx="1" fill="var(--pk-accent)" stroke="none" />
      <rect x="29" y="11" width="5" height="13" rx="1" fill="var(--pk-accent)" stroke="none" />
    </template>

    <template v-else-if="type === 'line-chart'">
      <polyline points="5,20 14,12 22,16 34,6" stroke="var(--pk-accent)" />
    </template>

    <template v-else-if="type === 'area-chart'">
      <path d="M5 20 L14 12 L22 16 L34 7 L34 24 L5 24 Z" fill="var(--pk-accent)" fill-opacity="0.25" stroke="none" />
      <polyline points="5,20 14,12 22,16 34,7" stroke="var(--pk-accent)" />
    </template>

    <template v-else-if="type === 'pie-chart'">
      <circle cx="20" cy="14" r="9" />
      <path d="M20 14 L20 5 A9 9 0 0 1 28.5 17 Z" fill="var(--pk-accent)" stroke="none" />
    </template>

    <template v-else-if="type === 'donut-chart'">
      <circle cx="20" cy="14" r="9" />
      <path d="M20 5 A9 9 0 0 1 29 14" stroke="var(--pk-accent)" stroke-width="3.5" />
    </template>

    <template v-else-if="type === 'scatter-chart'">
      <circle cx="9" cy="18" r="1.8" fill="var(--pk-accent)" stroke="none" />
      <circle cx="16" cy="10" r="1.8" fill="var(--pk-accent)" stroke="none" />
      <circle cx="23" cy="16" r="1.8" fill="var(--pk-accent)" stroke="none" />
      <circle cx="30" cy="8" r="1.8" fill="var(--pk-accent)" stroke="none" />
      <circle cx="27" cy="20" r="1.8" fill="var(--pk-accent)" stroke="none" />
    </template>

    <template v-else-if="type === 'radar-chart'">
      <polygon points="20,5 31,12 27,23 13,23 9,12" />
      <polygon points="20,10 26,13 24,19 16,19 14,13" fill="var(--pk-accent)" fill-opacity="0.3" stroke="var(--pk-accent)" />
    </template>

    <template v-else-if="type === 'stat-tile'">
      <path d="M6 9 h13" stroke-width="1.4" opacity="0.6" />
      <path d="M6 16 h20" stroke="var(--pk-accent)" stroke-width="3.4" />
      <path d="M30 13 l3 -3 l3 3" stroke="var(--pk-accent)" />
    </template>

    <template v-else-if="type === 'gauge'">
      <path d="M8 21 A12 12 0 0 1 32 21" />
      <path d="M8 21 A12 12 0 0 1 15 10" stroke="var(--pk-accent)" />
      <path d="M20 21 L26 13" stroke="var(--pk-accent)" />
    </template>

    <template v-else-if="type === 'progress'">
      <rect x="5" y="11" width="30" height="6" rx="3" />
      <rect x="5" y="11" width="18" height="6" rx="3" fill="var(--pk-accent)" stroke="none" />
    </template>

    <template v-else-if="type === 'svg-map'">
      <path d="M20 24 C13 17 10 13 10 10 a10 10 0 0 1 20 0 c0 3 -3 7 -10 14 Z" />
      <circle cx="20" cy="10" r="3" fill="var(--pk-accent)" stroke="none" />
    </template>

    <template v-else-if="type === 'ranking'">
      <rect x="10" y="6" width="24" height="4" rx="2" fill="var(--pk-accent)" stroke="none" />
      <rect x="10" y="13" width="17" height="4" rx="2" opacity="0.7" fill="currentColor" stroke="none" />
      <rect x="10" y="20" width="11" height="4" rx="2" opacity="0.5" fill="currentColor" stroke="none" />
      <circle cx="6" cy="8" r="1.4" fill="var(--pk-accent)" stroke="none" />
      <circle cx="6" cy="15" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6" cy="22" r="1.4" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="type === 'table'">
      <rect x="6" y="6" width="28" height="16" rx="2" />
      <line x1="6" y1="12" x2="34" y2="12" />
      <line x1="16" y1="6" x2="16" y2="22" />
      <line x1="25" y1="6" x2="25" y2="22" />
      <line x1="6" y1="17" x2="34" y2="17" opacity="0.6" />
    </template>

    <template v-else-if="type === 'section'">
      <rect x="6" y="7" width="3" height="14" rx="1.5" fill="var(--pk-accent)" stroke="none" />
      <path d="M13 11 h18" stroke-width="3" />
      <path d="M13 18 h11" opacity="0.55" />
    </template>

    <template v-else>
      <path d="M7 8 h26" />
      <path d="M7 14 h26" opacity="0.75" />
      <path d="M7 20 h16" opacity="0.55" />
    </template>
  </svg>
</template>
