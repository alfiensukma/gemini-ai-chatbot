<template>
  <div class="max-w-none text-gray-900 leading-relaxed" v-html="formattedContent"></div>
</template>

<script setup lang="ts">
interface Props {
  content: string
}

const props = defineProps<Props>()

// Function to format markdown-like content to HTML
const formattedContent = computed(() => {
  let formatted = props.content

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800 bg-gray-100 px-1 py-0.5 rounded text-sm">$1</strong>')
  
  // Convert `inline code` to <code>
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
  
  // Split into lines and process each
  const lines = formatted.split('\n')
  const processedLines = []
  let inList = false
  let inQuote = false
  let inCodeBlock = false
  let codeLanguage = ''
  
  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i]
    const line = originalLine.trim()
    
    // Handle code blocks first
    if (line.match(/^```/)) {
      if (!inCodeBlock) {
        if (inList) {
          processedLines.push('</div>')
          inList = false
        }
        if (inQuote) {
          processedLines.push('</div>')
          inQuote = false
        }
        codeLanguage = line.replace(/^```/, '').trim() || 'text'
        processedLines.push(`<div class="bg-gray-900 text-gray-100 rounded p-3 my-3 overflow-x-auto border">
          <div class="text-xs text-gray-400 mb-2 uppercase font-mono">${codeLanguage}</div>
          <pre class="text-xs font-mono whitespace-pre-wrap">`)
        inCodeBlock = true
      } else {
        processedLines.push('</pre></div>')
        inCodeBlock = false
        codeLanguage = ''
      }
      continue
    }

    if (inCodeBlock) {
      // Preserve original indentation and spacing for code
      processedLines.push(originalLine)
      continue
    }

    // Empty line
    if (line === '') {
      if (inList) {
        processedLines.push('</div>')
        inList = false
      }
      if (inQuote) {
        processedLines.push('</div>')
        inQuote = false
      }
      processedLines.push('<div class="h-2"></div>')
      continue
    }
    
    // Headers with ###
    if (line.match(/^###\s+(.+)$/)) {
      if (inList) {
        processedLines.push('</div>')
        inList = false
      }
      if (inQuote) {
        processedLines.push('</div>')
        inQuote = false
      }
      const headerText = line.replace(/^###\s+/, '')
      processedLines.push(`<h3 class="text-sm font-bold text-gray-900 mt-3 mb-2 pb-1 border-b border-gray-300">${headerText}</h3>`)
      continue
    }
    
    // Bullet points with *
    if (line.match(/^\*\s+(.+)$/)) {
      if (inQuote) {
        processedLines.push('</div>')
        inQuote = false
      }
      if (!inList) {
        processedLines.push('<div class="bg-gray-50 rounded p-2 my-2 border-l-2 border-gray-400">')
        inList = true
      }
      const listText = line.replace(/^\*\s+/, '')
      processedLines.push(`<div class="flex items-start space-x-2 mb-1.5 last:mb-0">
        <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></div>
        <div class="text-gray-800 text-sm leading-relaxed flex-1">${listText}</div>
      </div>`)
      
      // Check if next line is not a list item
      const nextLine = lines[i + 1]?.trim()
      if (!nextLine || !nextLine.match(/^\*\s+/)) {
        processedLines.push('</div>')
        inList = false
      }
      continue
    }
    
    // Structured info lines (lines with bullet points or key-value pairs)
    if (line.match(/^(•|●)\s+/) || line.match(/^[A-Za-z0-9\s]+:\s+/)) {
      if (inList) {
        processedLines.push('</div>')
        inList = false
      }
      if (!inQuote) {
        processedLines.push('<div class="bg-gray-100 rounded p-2 my-2 border-l-2 border-gray-500">')
        inQuote = true
      }
      
      // Format the info line
      let infoText = line.replace(/^(•|●)\s+/, '')
      // Make any text before colon bold (flexible key-value pattern)
      infoText = infoText.replace(/^([^:]+:)/g, '<span class="font-semibold text-gray-900">$1</span>')
      
      processedLines.push(`<div class="text-gray-800 text-sm leading-relaxed mb-1 last:mb-0">${infoText}</div>`)
      
      // Check if next line is similar structured info
      const nextLine = lines[i + 1]?.trim()
      if (!nextLine || (!nextLine.match(/^(•|●)\s+/) && !nextLine.match(/^[A-Za-z0-9\s]+:\s+/))) {
        processedLines.push('</div>')
        inQuote = false
      }
      continue
    }
    
    // Regular paragraph
    if (inList) {
      processedLines.push('</div>')
      inList = false
    }
    if (inQuote) {
      processedLines.push('</div>')
      inQuote = false
    }
    
    // Check if it's a summary/conclusion paragraph (more flexible patterns)
    const conclusionPatterns = /^(jadi|kesimpulan|ringkasan|summary|conclusion|in conclusion|therefore|thus|overall|to summarize|finally|in summary)/i
    
    if (conclusionPatterns.test(line.trim())) {
      processedLines.push(`<div class="bg-gray-200 border-l-2 border-gray-600 p-2 my-2 rounded-r">
        <p class="text-gray-900 text-sm leading-relaxed font-medium">${line}</p>
      </div>`)
    } else {
      processedLines.push(`<p class="text-gray-800 text-sm leading-relaxed mb-2">${line}</p>`)
    }
  }
  
  // Close any open containers
  if (inCodeBlock) {
    processedLines.push('</pre></div>')
  }
  if (inList) {
    processedLines.push('</div>')
  }
  if (inQuote) {
    processedLines.push('</div>')
  }
  
  return processedLines.join('')
})
</script>