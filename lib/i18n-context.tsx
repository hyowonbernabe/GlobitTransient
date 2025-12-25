'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'fil'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

import { dictionary } from '@/lib/dictionary'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  // Persist language preference
  useEffect(() => {
    const saved = localStorage.getItem('globit-lang') as Language
    if (saved) setLanguage(saved)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('globit-lang', lang)
  }

  // Simple translation helper
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = dictionary[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Fallback if missing
      }
    }
    
    return value || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}