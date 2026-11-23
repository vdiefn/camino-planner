import type LocaleLink from '@/components/common/LocaleLink.vue'

declare module 'vue' {
  export interface GlobalComponents {
    LocaleLink: typeof LocaleLink
  }
}

export {}
