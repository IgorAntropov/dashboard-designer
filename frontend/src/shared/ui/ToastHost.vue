<script setup lang="ts">
import { dismissToast, useToasts } from '@shared/notify'

const toasts = useToasts()
</script>

<template>
  <Teleport to="body">
    <div class="pk-toasts" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts.items"
          :key="toast.id"
          class="pk-toast"
          :class="`pk-toast--${toast.type}`"
        >
          <span class="pk-toast__msg">{{ toast.message }}</span>
          <button
            type="button"
            class="pk-toast__close"
            :aria-label="$t('toast.close')"
            @click="dismissToast(toast.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.pk-toasts {
  position: fixed;
  bottom: 1.1rem;
  right: 1.1rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(360px, calc(100vw - 2rem));
}

.pk-toast {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.7rem 0.85rem;
  border-radius: 0.7rem;
  background-color: var(--pk-surface);
  border: 1px solid var(--pk-border);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  color: var(--pk-text);
}

.pk-toast--error {
  border-left: 3px solid #ef4444;
}

.pk-toast--success {
  border-left: 3px solid #22c55e;
}

.pk-toast--info {
  border-left: 3px solid var(--pk-accent);
}

.pk-toast__msg {
  flex: 1 1 auto;
  font-size: 0.9rem;
  line-height: 1.35;
}

.pk-toast__close {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  color: var(--pk-muted);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.pk-toast__close:hover {
  color: var(--pk-text);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
