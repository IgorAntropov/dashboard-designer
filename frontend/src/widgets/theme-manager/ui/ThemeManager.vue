<script setup lang="ts">
import type { RenderTheme } from '@panelka/renderer'
import { getTheme } from '@panelka/renderer'
import { onMounted, ref } from 'vue'

import type { UserTheme } from '@entities/user-theme'
import {
  createUserTheme,
  deleteUserTheme,
  listUserThemes,
  updateUserTheme,
} from '@entities/user-theme'
import { pushToast } from '@shared/notify'
import { AppButton, ThemeColorFields } from '@shared/ui'

interface Draft {
  id: string | null
  name: string
  tokens: RenderTheme
}

const { t } = useI18n()
const themes = ref<UserTheme[]>([])
const draft = ref<Draft | null>(null)
const pending = ref(false)

function clone(theme: RenderTheme): RenderTheme {
  return { ...theme, colorSeries: [...theme.colorSeries] }
}

async function load(): Promise<void> {
  themes.value = await listUserThemes()
}

onMounted(load)

function startNew(): void {
  draft.value = { id: null, name: '', tokens: clone(getTheme('light-minimal')) }
}

function startEdit(theme: UserTheme): void {
  draft.value = { id: theme.id, name: theme.name, tokens: clone(theme.tokens) }
}

function cancel(): void {
  draft.value = null
}

async function save(): Promise<void> {
  if (!draft.value || !draft.value.name.trim()) {
    return
  }
  pending.value = true
  const { id, name, tokens } = draft.value
  const result = id
    ? await updateUserTheme(id, { name: name.trim(), tokens })
    : await createUserTheme(name.trim(), tokens)
  pending.value = false
  if (result) {
    pushToast(t('themes.saved'), 'success')
    draft.value = null
    await load()
  }
}

async function remove(theme: UserTheme): Promise<void> {
  if (!window.confirm(t('themes.deleteConfirm'))) {
    return
  }
  if (await deleteUserTheme(theme.id)) {
    await load()
  }
}
</script>

<template>
  <section class="theme-manager">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="h5 mb-0">{{ $t('themes.title') }}</h2>
      <AppButton size="sm" icon="plus" @click="startNew">
        {{ $t('themes.new') }}
      </AppButton>
    </div>

    <p v-if="themes.length === 0 && !draft" class="text-muted small">
      {{ $t('themes.empty') }}
    </p>

    <ul v-if="themes.length" class="theme-manager__list">
      <li v-for="theme in themes" :key="theme.id" class="theme-manager__item">
        <span class="theme-manager__swatches" aria-hidden="true">
          <span
            v-for="(color, index) in [
              theme.tokens.colorAccent,
              ...theme.tokens.colorSeries.slice(0, 4),
            ]"
            :key="index"
            class="theme-manager__dot"
            :style="{ backgroundColor: color }"
          />
        </span>
        <span class="theme-manager__name">{{ theme.name }}</span>
        <span class="theme-manager__actions">
          <AppButton
            size="sm"
            variant="ghost"
            icon="edit"
            icon-only
            :aria-label="$t('themes.edit')"
            @click="startEdit(theme)"
          />
          <AppButton
            size="sm"
            variant="ghost"
            icon="trash"
            icon-only
            :aria-label="$t('themes.delete')"
            @click="remove(theme)"
          />
        </span>
      </li>
    </ul>

    <div v-if="draft" class="theme-manager__editor">
      <div class="mb-3">
        <label class="form-label small">{{ $t('themes.name') }}</label>
        <input
          v-model="draft.name"
          class="form-control form-control-sm"
          :placeholder="$t('themes.namePlaceholder')"
        >
      </div>

      <ThemeColorFields v-model="draft.tokens" />

      <div class="d-flex gap-2 mt-3">
        <AppButton
          size="sm"
          :disabled="pending || !draft.name.trim()"
          @click="save"
        >
          {{ $t('themes.save') }}
        </AppButton>
        <AppButton size="sm" variant="secondary" @click="cancel">
          {{ $t('themes.cancel') }}
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.theme-manager {
  background-color: var(--pk-surface);
  border: 1px solid var(--pk-border);
  border-radius: var(--pk-radius-lg);
  box-shadow: var(--pk-shadow-card);
  padding: 1.25rem;
}

.theme-manager__list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.theme-manager__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--pk-border);
  border-radius: 0.6rem;
  background-color: var(--pk-surface);
}

.theme-manager__swatches {
  display: inline-flex;
  gap: 0.25rem;
  flex: 0 0 auto;
}

.theme-manager__dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.theme-manager__name {
  flex: 1 1 auto;
  font-weight: 600;
}

.theme-manager__actions {
  display: inline-flex;
  gap: 0.35rem;
}

.theme-manager__editor {
  padding: 1rem;
  border: 1px solid var(--pk-border);
  border-radius: 0.7rem;
  background-color: var(--pk-surface);
  max-width: 28rem;
}
</style>
