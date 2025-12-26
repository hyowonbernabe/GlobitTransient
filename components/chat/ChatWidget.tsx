'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
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
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2 text-gray-900">
            {isOpen && (
                <Card className="w-[350px] h-[500px] shadow-2xl border-emerald-100 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="bg-emerald-900 text-white p-4 rounded-t-xl flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border-2 border-white/20">
                                <AvatarImage src="/assets/images/placeholder.png" />
                                <AvatarFallback className="bg-emerald-700 text-white text-xs">AI</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-sm font-bold">Globit Assistant</CardTitle>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("w-1.5 h-1.5 rounded-full", isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400")} />
                                    <span className="text-[10px] text-emerald-100/80">{isLoading ? 'Thinking...' : 'Online'}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-white/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <Minimize2 className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0 flex-1 overflow-hidden relative bg-gray-50">
                        <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
                            {messages.length === 0 && (
                                <div className="text-center text-gray-500 text-sm mt-8 space-y-2">
                                    <p>👋 Hi there! I'm your virtual concierge.</p>
                                    <p className="text-xs">Ask me about rates, parking, or availability!</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={cn(
                                            "flex gap-3 max-w-[85%]",
                                            m.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                                        )}
                                    >
                                        <Avatar className="w-6 h-6 mt-1 border border-gray-200">
                                            <AvatarFallback className={m.role === 'user' ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}>
                                                {m.role === 'user' ? 'U' : 'AI'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={cn(
                                                "rounded-2xl px-3 py-2 text-sm shadow-sm",
                                                m.role === 'user'
                                                    ? "bg-blue-600 text-white rounded-tr-none"
                                                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                            )}
                                        >
                                            {renderMessageContent(m)}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 self-start max-w-[85%]">
                                        <Avatar className="w-6 h-6 mt-1 border border-gray-200">
                                            <AvatarFallback className="bg-emerald-600 text-white">AI</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 border border-gray-100 shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 bg-white border-t border-gray-100 shrink-0">
                        <form onSubmit={handleFormSubmit} className="flex w-full gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 bg-gray-50 focus-visible:ring-emerald-500"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            <Button
                size="lg"
                className={cn(
                    "rounded-full h-14 w-14 shadow-lg transition-all duration-300",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-emerald-600 hover:bg-emerald-700 hover:scale-110"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </Button>
        </div>
    )
}