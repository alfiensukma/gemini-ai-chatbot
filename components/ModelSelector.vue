<script setup lang="ts">
const models = [
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' }
]

const selectedModel = useState('selectedModel', () => 'gemini-2.5-pro')
const isOpen = ref(false)

const handleModelChange = (value: string) => {
  selectedModel.value = value
  isOpen.value = false
  console.log('Model changed to:', value)
}

const currentModelLabel = computed(() => {
  return models.find(model => model.value === selectedModel.value)?.label || 'Select Model'
})
</script>

<template>
  <div class="relative flex items-center space-x-3">
    <div class="relative">
      <button
        @click="isOpen = !isOpen"
        class="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 
            bg-transparent hover:bg-gray-100 rounded-lg outline-none cursor-pointer"
      >
        {{ currentModelLabel }}
        <svg 
          class="w-4 h-4 ml-2 transition-transform duration-200" 
          :class="{ 'rotate-180': isOpen }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      
      <div 
        v-show="isOpen"
        class="absolute top-full mt-1 min-w-[180px] bg-white border border-gray-200 rounded-lg 
            shadow-lg z-50 py-1"
      >
        <button
          v-for="model in models"
          :key="model.value"
          @click="handleModelChange(model.value)"
          class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 
            focus:outline-none transition-colors duration-150 flex items-center justify-between"
          :class="{ 'bg-blue-50 text-blue-700': selectedModel === model.value }"
        >
          {{ model.label }}
          <svg 
            v-if="selectedModel === model.value"
            class="w-4 h-4 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div 
      v-if="isOpen" 
      @click="isOpen = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>