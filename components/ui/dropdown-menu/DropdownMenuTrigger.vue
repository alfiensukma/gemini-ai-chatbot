<script setup lang="ts">
import { DropdownMenuTrigger } from 'radix-vue'
import { cn } from '@/lib/utils'

interface DropdownMenuTriggerProps {
  asChild?: boolean
  class?: string
}

const props = withDefaults(defineProps<DropdownMenuTriggerProps>(), {
  asChild: false
})
</script>

<template>
  <DropdownMenuTrigger
    :as-child="props.asChild"
    :class="cn('outline-none', props.class)"
  >
    <slot />
  </DropdownMenuTrigger>
</template>