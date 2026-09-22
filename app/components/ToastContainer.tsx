'use client'

import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'

interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            padding: '12px 16px',
            borderLeft: `4px solid ${t.type === 'success' ? 'var(--ac-teal)' : t.type === 'error' ? 'var(--ac-danger)' : 'var(--ac-brass)'}`,
            background: 'var(--ac-navy-800)',
            borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0',
            color: t.type === 'success' ? 'var(--ac-teal)' : t.type === 'error' ? 'var(--ac-danger)' : 'var(--ac-brass)',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <p className="ac-small" style={{ margin: 0, color: 'var(--ac-text)' }}>{t.message}</p>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
