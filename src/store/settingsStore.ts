import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SupportedLang } from '../core/nlu/types'

type SettingsStore = {
  lang: SupportedLang
  experimentMode: boolean
  setLang: (lang: SupportedLang) => void
  setExperimentMode: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      lang: 'ru',
      experimentMode: false,
      setLang: (lang) => set({ lang }),
      setExperimentMode: (experimentMode) => set({ experimentMode }),
    }),
    { name: 'voicecanvas-settings' },
  ),
)
