import * as React from "react"
import { motion } from "framer-motion"
import { Users, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaxInputProps {
  value: number
  onChange: (value: number) => void
  onNext: () => void
  onSkip: () => void
}

export function PaxInput({ value, onChange, onNext, onSkip }: PaxInputProps) {
  const handleIncrement = () => onChange(Math.min(value + 1, 30))
  const handleDecrement = () => onChange(Math.max(value - 1, 1))

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex-1 flex flex-col justify-center items-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <Users size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Who's coming?
          </h2>
          <p className="text-gray-500">
            Includes adults and kids.
          </p>
        </motion.div>

        <div className="flex items-center gap-8">
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-gray-200"
            onClick={handleDecrement}
            disabled={value <= 1}
          >
            <Minus className="h-6 w-6" />
          </Button>

          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-bold text-gray-900 tabular-nums"
          >
            {value}
          </motion.div>

          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-gray-200"
            onClick={handleIncrement}
            disabled={value >= 30}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pt-6 pb-4 flex flex-col gap-4"
      >
        <Button 
          size="lg" 
          className="w-full h-14 text-lg rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
          onClick={onNext}
        >
          Next
        </Button>
        
        <button 
            onClick={onSkip}
            className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors py-2"
        >
            Skip and view all rooms
        </button>
      </motion.div>
    </div>
  )
}