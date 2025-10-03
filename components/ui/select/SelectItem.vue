<script setup lang="ts">
import { SelectItem as RadixSelectItem } from 'radix-vue'
import { cn } from '@/lib/utils'

interface SelectItemProps {
  value: string
  class?: string
}

const props = defineProps<SelectItemProps>()
</script>

<template>
  <RadixSelectItem
    :value="props.value"
    :class="cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    )"
  >
    <slot />
  </RadixSelectItem>
</template>