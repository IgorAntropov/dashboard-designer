<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    minlength?: number
  }>(),
  { minlength: undefined },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const visible = ref(false)

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="form-floating pk-password mb-3">
    <input
      :id="props.id"
      :type="visible ? 'text' : 'password'"
      class="form-control"
      :placeholder="props.label"
      :value="props.modelValue"
      :minlength="props.minlength"
      required
      @input="onInput"
    >
    <label :for="props.id">{{ props.label }}</label>

    <button
      type="button"
      class="pk-password__toggle"
      :aria-pressed="visible"
      :aria-label="props.label"
      @click="visible = !visible"
    >
      <svg
        v-if="visible"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19"
        />
        <path d="M1 1l22 22" />
      </svg>
      <svg
        v-else
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
</template>
