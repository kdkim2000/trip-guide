<script setup lang="ts">
import type { LanguagePhrase } from '~/types'

defineProps<{
  phrase: LanguagePhrase
}>()
</script>

<template>
  <div class="px-4 py-3">
    <p class="text-footnote text-apple-gray-500">{{ phrase.korean }}</p>
    <p class="text-body font-medium dark:text-white mt-1">{{ phrase.foreign }}</p>
    <p class="text-footnote text-apple-blue dark:text-apple-blue-dark mt-0.5">{{ phrase.pronunciation }}</p>
  </div>
</template>
