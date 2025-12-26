'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, X, Send, Loader2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)

    // AI SDK v3: useChat returns 'sendMessage' to send a message to the conversation.
    // We use 'status' to check loading state.
    const { messages, status, sendMessage } = useChat()
    const [inputValue, setInputValue] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    // Listen for custom event to open chat
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true)
        window.addEventListener('open-chat', handleOpenChat)
        return () => window.removeEventListener('open-chat', handleOpenChat)
    }, [])

    const isLoading = status === 'streaming' || status === 'submitted'

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        // Send message using 'sendMessage' with text content
        sendMessage({ text: inputValue })
        setInputValue('')
    }

    // Helper to render message content from parts (v5+ structure)
    const renderMessageContent = (m: any) => {
        // If parts exist (v5+), use them
        if (m.parts && Array.isArray(m.parts)) {
            return m.parts.map((part: any, i: number) => {
                if (part.type === 'text') return <span key={i}>{part.text}</span>
                return null // Handle other parts like tools if needed
            })
        }
        // Fallback for string content if present (legacy or simple text mode)
        return m.content
    }

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 text-gray-900">
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        layoutId="chat-widget"
                        initial={{ opacity: 0, scale: 0.5, y: 100, x: 50, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.5, y: 100, x: 50, filter: 'blur(10px)' }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                            mass: 0.8
                        }}
                        className="origin-bottom-right"
                    >
                        <Card className="w-[380px] h-[600px] shadow-[0_48px_100px_-24px_rgba(6,78,59,0.4)] flex flex-col rounded-[2.5rem] overflow-hidden border-none ring-1 ring-emerald-900/10 bg-white">
                            <CardHeader className="bg-emerald-950 text-white p-6 rounded-t-[2.5rem] flex flex-row items-center justify-between shrink-0 relative overflow-hidden">
                                {/* Decorative Gradient Blobs */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

                                <div className="flex items-center gap-3 relative z-10">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Avatar className="w-10 h-10 border-2 border-emerald-800 shadow-lg">
                                            <AvatarImage src="/assets/images/placeholder.png" />
                                            <AvatarFallback className="bg-emerald-700 text-white text-xs font-black">AI</AvatarFallback>
                                        </Avatar>
                                    </motion.div>
                                    <div>
                                        <CardTitle className="text-sm font-black tracking-tight">Globit Assistant</CardTitle>
                                        <div className="flex items-center gap-1.5">
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className={cn("w-2 h-2 rounded-full", isLoading ? "bg-amber-400" : "bg-green-400")}
                                            />
                                            <span className="text-[10px] uppercase font-bold text-emerald-100/60 tracking-wider">
                                                {isLoading ? 'Thinking...' : 'Virtual Concierge'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-100/60 hover:text-white hover:bg-white/10 relative z-10 rounded-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Minimize2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>

                            <CardContent className="p-0 flex-1 overflow-hidden relative bg-emerald-50">
                                <ScrollArea className="h-full" ref={scrollRef}>
                                    <div className="px-6 py-6 min-h-full">
                                        {messages.length === 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-center text-emerald-900/40 text-sm mt-12 space-y-3"
                                            >
                                                <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl">
                                                    👋
                                                </div>
                                                <p className="font-bold text-emerald-900/60">How can I help you today?</p>
                                                <p className="text-xs px-8">Ask me about room rates, local spots, or parking availability.</p>
                                            </motion.div>
                                        )}

                                        <div className="flex flex-col gap-4">
                                            <AnimatePresence initial={false}>
                                                {messages.map((m, idx) => (
                                                    <motion.div
                                                        key={m.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 20, scale: 0.9, originX: m.role === 'user' ? 1 : 0 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 500,
                                                            damping: 30,
                                                            delay: 0.1
                                                        }}
                                                        className={cn(
                                                            "flex gap-3 max-w-[85%] group",
                                                            m.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                                                        )}
                                                    >
                                                        <Avatar className="w-8 h-8 mt-1 border border-white/50 shadow-sm shrink-0">
                                                            <AvatarFallback className={cn(
                                                                "font-bold text-[10px]",
                                                                m.role === 'user' ? "bg-emerald-950 text-white" : "bg-emerald-600 text-white"
                                                            )}>
                                                                {m.role === 'user' ? 'ME' : 'AI'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div
                                                            className={cn(
                                                                "rounded-3xl px-4 py-3 text-sm shadow-sm transition-all duration-300",
                                                                m.role === 'user'
                                                                    ? "bg-emerald-900 text-white rounded-tr-none"
                                                                    : "bg-white text-gray-800 border border-emerald-100 rounded-tl-none group-hover:border-emerald-200"
                                                            )}
                                                        >
                                                            {renderMessageContent(m)}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {isLoading && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex gap-3 self-start max-w-[85%]"
                                                >
                                                    <Avatar className="w-8 h-8 mt-1 border border-white/50 shadow-sm shrink-0">
                                                        <AvatarFallback className="bg-emerald-600 text-white font-bold text-[10px]">AI</AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-white rounded-3xl rounded-tl-none px-4 py-3 border border-emerald-100 shadow-sm">
                                                        <div className="flex gap-1.5 items-center h-4">
                                                            {[0, 1, 2].map((i) => (
                                                                <motion.span
                                                                    key={i}
                                                                    animate={{ y: [0, -4, 0] }}
                                                                    transition={{
                                                                        duration: 0.6,
                                                                        repeat: Infinity,
                                                                        delay: i * 0.15,
                                                                        ease: "easeInOut"
                                                                    }}
                                                                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            <CardFooter className="p-4 bg-gray-50 border-t border-emerald-900/5 shrink-0">
                                <form onSubmit={handleFormSubmit} className="flex w-full gap-2 relative">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-white border-none shadow-sm focus-visible:ring-emerald-500 rounded-2xl h-12 pr-12"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !inputValue.trim()}
                                        className="absolute right-1 top-1 h-10 w-10 bg-emerald-950 hover:bg-emerald-900 rounded-xl transition-all active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                layoutId="chat-widget"
                className="relative"
            >
                <Button
                    size="icon"
                    className={cn(
                        "group relative h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
                        isOpen
                            ? "bg-red-500 hover:bg-red-600 border-b-4 border-red-700"
                            : "bg-emerald-950 hover:bg-emerald-900 border-b-4 border-emerald-800 hover:-translate-y-1 active:translate-y-0 active:border-b-0"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <motion.div
                        initial={false}
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        className="flex items-center justify-center p-0"
                    >
                        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
                    </motion.div>

                    {/* Shine Effect */}
                    {!isOpen && (
                        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                            <motion.div
                                initial={{ left: '-100%' }}
                                animate={{ left: '100%' }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
                                className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                            />
                        </div>
                    )}
                </Button>
            </motion.div>
        </div>
    )
}