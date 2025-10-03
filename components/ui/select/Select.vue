<script setup lang="ts">
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from 'radix-vue'
import { cn } from '@/lib/utils'

interface SelectProps {
  modelValue?: string
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: 'Select an option'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val || '')
})
</script>

<template>
  <SelectRoot v-model="value">
    <SelectTrigger 
      :class="cn(
        'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class
      )"
    >
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent class="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
      <slot />
    </SelectContent>
  </SelectRoot>
</template>