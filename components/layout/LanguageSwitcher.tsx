'use client'

import { useI18n } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('en')}
        className={cn(
          "h-7 px-2 text-xs font-bold transition-all",
          language === 'en' ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
        )}
      >
        EN
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('fil')}
        className={cn(
          "h-7 px-2 text-xs font-bold transition-all",
          language === 'fil' ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
        )}
      >
        FIL
      </Button>
    </div>
  )
}