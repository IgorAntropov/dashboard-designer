<script setup lang="ts">
import type { RenderTheme } from '@panelka/renderer'
import type { WidgetInstance } from '@entities/widget'
import { computed, onMounted, ref, watch } from 'vue'

import type { Dashboard } from '@entities/dashboard'
import { getDashboard, updateDashboard } from '@entities/dashboard'
import { AppButton } from '@shared/ui'
import { DashboardCanvas, useCanvasStore } from '@widgets/canvas'
import { ConfigPanel } from '@widgets/config-panel'
import { WidgetPalette } from '@widgets/palette'
import { ThemeSelector } from '@widgets/theme-switcher'

const { t } = useI18n()
const route = useRoute()
const canvasStore = useCanvasStore()
const dashboardId = route.params.id as string

const dashboard = ref<Dashboard | null>(null)
const titleInput = ref('')

const ready = ref(false)
const saveState = ref<'idle' | 'saving' | 'saved'>('idle')
let saveTimer: ReturnType<typeof setTimeout> | null = null

async function save(): Promise<void> {
  saveState.value = 'saving'
  const patch = {
    title: titleInput.value.trim() || t('editor.title'),
    layout: { widgets: canvasStore.widgets },
    theme_key: canvasStore.themeKey,
    theme_tokens:
      canvasStore.themeKey === 'custom' ? canvasStore.customTheme : null,
  }
  const result = await updateDashboard(dashboardId, patch)
  saveState.value = result.data ? 'saved' : 'idle'
}

onMounted(async () => {
  const loaded = await getDashboard(dashboardId)
  dashboard.value = loaded
  titleInput.value = loaded?.title ?? ''
  const layout = (loaded?.layout ?? {}) as { widgets?: WidgetInstance[] }
  canvasStore.hydrate(
    Array.isArray(layout.widgets) ? layout.widgets : [],
    loaded?.theme_key ?? 'light-minimal',
    (loaded?.theme_tokens as RenderTheme | null) ?? null,
  )
  ready.value = true
})

watch(
  [() => canvasStore.widgets, () => canvasStore.themeKey, titleInput],
  () => {
    if (!ready.value) {
      return
    }
    saveState.value = 'idle'
    if (saveTimer) {
      clearTimeout(saveTimer)
    }
    saveTimer = setTimeout(save, 900)
  },
  { deep: true },
)

useHead({ title: computed(() => titleInput.value || t('editor.title')) })
</script>

<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3 gap-2">
      <input
        v-model="titleInput"
        class="editor-title-input"
        :placeholder="$t('editor.title')"
      >

      <div class="d-flex align-items-center gap-2">
        <ClientOnly>
          <span
            class="small text-muted"
            :class="{ invisible: saveState === 'idle' }"
          >
            {{ saveState === 'saving' ? $t('editor.saving') : $t('editor.saved') }}
          </span>

          <AppButton
            variant="ghost"
            size="sm"
            icon="undo"
            icon-only
            :aria-label="$t('editor.undo')"
            :title="$t('editor.undo')"
            :disabled="!canvasStore.canUndo"
            @click="canvasStore.undo()"
          />
          <AppButton
            variant="ghost"
            size="sm"
            icon="redo"
            icon-only
            :aria-label="$t('editor.redo')"
            :title="$t('editor.redo')"
            :disabled="!canvasStore.canRedo"
            @click="canvasStore.redo()"
          />

          <span class="small text-muted">{{ $t('editor.theme') }}</span>
          <ThemeSelector />

          <AppButton size="sm" icon="save" @click="save">
            {{ $t('editor.save') }}
          </AppButton>
        </ClientOnly>

        <AppButton to="/dashboards" variant="secondary" size="sm" icon="back">
          {{ $t('editor.back') }}
        </AppButton>
      </div>
    </div>

    <ClientOnly>
      <WidgetPalette class="mb-3" />
      <div class="editor-workspace">
        <DashboardCanvas class="editor-workspace__canvas" />
        <ConfigPanel class="editor-workspace__panel" />
      </div>
    </ClientOnly>
  </div>
</template>
