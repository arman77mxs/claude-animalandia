'use client'
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toast: (msg: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (e: CustomEvent<{ message: string; type: Toast['type'] }>) => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { id, message: e.detail.message, type: e.detail.type || 'info' }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }
    window.addEventListener('show-toast' as never, handler as EventListener)
    return () => window.removeEventListener('show-toast' as never, handler as EventListener)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          'px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs animate-in slide-in-from-right-2',
          t.type === 'success' && 'bg-green-500 text-white',
          t.type === 'error' && 'bg-red-500 text-white',
          t.type === 'info' && 'bg-[var(--primary)] text-[var(--primary-foreground)]'
        )}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

export function toast(message: string, type: Toast['type'] = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }))
}
