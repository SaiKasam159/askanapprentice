type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

export const toast = {
  success: (message: string) => {
    const id = Date.now().toString()
    toasts = [...toasts, { id, message, type: 'success' }]
    notifyListeners()
    setTimeout(() => removeToast(id), 4000)
  },
  error: (message: string) => {
    const id = Date.now().toString()
    toasts = [...toasts, { id, message, type: 'error' }]
    notifyListeners()
    setTimeout(() => removeToast(id), 5000)
  },
  info: (message: string) => {
    const id = Date.now().toString()
    toasts = [...toasts, { id, message, type: 'info' }]
    notifyListeners()
    setTimeout(() => removeToast(id), 4000)
  },
  subscribe: (listener: (toasts: Toast[]) => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  },
  getToasts: () => toasts,
}

function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id)
  notifyListeners()
}

function notifyListeners() {
  listeners.forEach(listener => listener(toasts))
}
