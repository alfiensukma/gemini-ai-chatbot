<script setup lang="ts">
import { DropdownMenuRoot } from 'radix-vue'

interface DropdownMenuProps {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
}

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  modal: true
})

const emits = defineEmits<{
  'update:open': [open: boolean]
}>()
</script>

<template>
  <DropdownMenuRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="emits('update:open', $event)"
  >
    <slot />
  </DropdownMenuRoot>
</template>