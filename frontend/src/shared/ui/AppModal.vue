<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{ modelValue: boolean; title?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close(): void {
  emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="pk-modal" @click.self="close">
        <div class="pk-modal__panel" role="dialog" aria-modal="true">
          <header class="pk-modal__head">
            <h2 class="pk-modal__title">{{ title }}</h2>
            <button
              class="pk-modal__close"
              type="button"
              aria-label="Close"
              @click="close"
            >
              ×
            </button>
          </header>

          <div class="pk-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="pk-modal__foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
