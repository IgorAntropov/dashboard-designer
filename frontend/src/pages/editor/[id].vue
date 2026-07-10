<script setup lang="ts">
import type { RenderTheme } from '@panelka/renderer'
import type { WidgetInstance } from '@entities/widget'
import { computed, onMounted, ref, watch } from 'vue'

import type { Dashboard } from '@entities/dashboard'
import { getDashboard, updateDashboard } from '@entities/dashboard'
import { AppButton } from '@shared/ui'
import { DashboardCanvas, useCanvasStore } from '@widgets/canvas'
import { ConfigPanelModal } from '@widgets/config-panel'
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
  <div class="editor">
    <header class="editor-toolbar">
      <div class="editor-toolbar__group">
        <input
          v-model="titleInput"
          class="editor-title-input"
          :placeholder="$t('editor.title')"
        >

        <ClientOnly>
          <div class="editor-toolbar__history">
            <AppButton
              v-tooltip:bottom="$t('editor.undo')"
              variant="ghost"
              size="sm"
              icon="undo"
              icon-only
              :aria-label="$t('editor.undo')"
              :disabled="!canvasStore.canUndo"
              @click="canvasStore.undo()"
            />
            <AppButton
              v-tooltip:bottom="$t('editor.redo')"
              variant="ghost"
              size="sm"
              icon="redo"
              icon-only
              :aria-label="$t('editor.redo')"
              :disabled="!canvasStore.canRedo"
              @click="canvasStore.redo()"
            />
          </div>
        </ClientOnly>
      </div>

      <div class="editor-toolbar__group">
        <span class="small text-muted d-none d-lg-inline">{{ $t('editor.theme') }}</span>
        <ClientOnly><ThemeSelector /></ClientOnly>

        <ClientOnly>
          <span
            class="editor-save small text-muted"
            :class="{ invisible: saveState === 'idle' }"
          >
            {{ saveState === 'saving' ? $t('editor.saving') : $t('editor.saved') }}
          </span>
          <AppButton
            v-tooltip:bottom="$t('editor.save')"
            size="sm"
            icon="save"
            icon-only
            :aria-label="$t('editor.save')"
            @click="save"
          />
        </ClientOnly>

        <AppButton to="/dashboards" variant="secondary" size="sm" icon="back">
          {{ $t('editor.toDashboards') }}
        </AppButton>
      </div>
    </header>

    <div class="editor-body">
      <ClientOnly>
        <div class="editor-canvas-wrap">
          <DashboardCanvas />
        </div>
        <WidgetPalette class="editor-palette" />
        <ConfigPanelModal />
      </ClientOnly>
    </div>
  </div>
</template>
