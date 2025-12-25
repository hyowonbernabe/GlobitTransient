'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getNotifications, markAllAsRead } from '@/server/actions/notification'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

// Define the type explicitly to prevent 'any' errors
type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  link: string | null
  type: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = async () => {
    const data = await getNotifications()
    // Ensure the data from server matches our type (dates might need parsing if passed as strings)
    const typedData = data.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt)
    })) as Notification[]
    
    setNotifications(typedData)
    setUnreadCount(typedData.filter((n: Notification) => !n.isRead).length)
  }

  // Initial fetch + simple polling every minute
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && unreadCount > 0) {
      // Mark as read when opening
      markAllAsRead()
      // Optimistically update UI
      setUnreadCount(0)
      setNotifications(prev => prev.map((n: Notification) => ({ ...n, isRead: true })))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white/80 hover:text-white hover:bg-white/10">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-emerald-600 font-medium">{unreadCount} new</span>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n: Notification) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative",
                    !n.isRead && "bg-blue-50/30"
                  )}
                >
                  {!n.isRead && (
                    <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                  <h5 className="text-sm font-medium text-gray-900 mb-1">{n.title}</h5>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{n.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                    </span>
                    {n.link && (
                      <Link href={n.link} onClick={() => setIsOpen(false)} className="text-[10px] text-emerald-600 font-bold hover:underline">
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}