<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md'
    to?: string
    type?: 'button' | 'submit'
    disabled?: boolean
    block?: boolean
    icon?: string
    iconOnly?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    to: undefined,
    type: 'button',
    disabled: false,
    block: false,
    icon: undefined,
    iconOnly: false,
  },
)

const variantClass: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-outline-secondary',
  danger: 'btn-outline-danger',
  ghost: 'pk-btn--ghost',
}

const classes = computed(() =>
  [
    'btn',
    'pk-btn',
    variantClass[props.variant],
    props.size === 'sm' ? 'btn-sm' : '',
    props.block ? 'w-100' : '',
    props.iconOnly ? 'pk-btn--icon' : '',
  ].filter(Boolean),
)
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <AppIcon v-if="icon" :name="icon" class="pk-btn__icon" />
    <span v-if="!iconOnly"><slot /></span>
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" :class="classes">
    <AppIcon v-if="icon" :name="icon" class="pk-btn__icon" />
    <span v-if="!iconOnly"><slot /></span>
  </button>
</template>
