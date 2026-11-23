<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RouteLocationRaw } from 'vue-router'
import { localizePath, type SupportedLocale } from '@/utils/localeRoute'

interface Props {
  to: RouteLocationRaw
}

const props = defineProps<Props>()
const { locale } = useI18n()

const resolvedTo = computed<RouteLocationRaw>(() => {
  const currentLocale = (locale.value === 'en' ? 'en' : 'zh-TW') as SupportedLocale
  if (typeof props.to === 'string') {
    return localizePath(props.to, currentLocale)
  }
  if (props.to && typeof props.to === 'object' && 'path' in props.to && typeof props.to.path === 'string') {
    return {
      ...props.to,
      path: localizePath(props.to.path, currentLocale),
    }
  }
  return props.to
})
</script>

<template>
  <router-link :to="resolvedTo" v-bind="$attrs">
    <slot />
  </router-link>
</template>
