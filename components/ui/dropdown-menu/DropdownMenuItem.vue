<script setup lang="ts">
import { DropdownMenuItem } from 'radix-vue'
import { cn } from '@/lib/utils'

interface DropdownMenuItemProps {
  class?: string
  inset?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<DropdownMenuItemProps>(), {
  inset: false,
  disabled: false
})

const emits = defineEmits<{
  select: [event: Event]
}>()
</script>

<template>
  <DropdownMenuItem
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      props.class
    )"
    :disabled="props.disabled"
    @select="emits('select', $event)"
  >
    <slot />
  </DropdownMenuItem>
</template>