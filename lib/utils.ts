
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Hoje'
  if (diffInDays === 1) return 'Ontem'
  if (diffInDays < 7) return `${diffInDays} dias atrás`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`
  return formatDate(d)
}

export function getMoodColor(mood?: number): string {
  if (!mood) return '#6b7280'
  
  if (mood <= 3) return '#ef4444' // red
  if (mood <= 5) return '#f59e0b' // amber
  if (mood <= 7) return '#eab308' // yellow
  if (mood <= 8) return '#84cc16' // lime
  return '#22c55e' // green
}

export function getMoodColorClass(mood?: number): string {
  if (!mood) return 'text-gray-500'
  
  if (mood <= 3) return 'text-red-500'
  if (mood <= 5) return 'text-amber-500'
  if (mood <= 7) return 'text-yellow-500'
  if (mood <= 8) return 'text-lime-500'
  return 'text-green-500'
}

export function getMoodBgColorClass(mood?: number): string {
  if (!mood) return 'bg-gray-100'
  
  if (mood <= 3) return 'bg-red-100'
  if (mood <= 5) return 'bg-amber-100'
  if (mood <= 7) return 'bg-yellow-100'
  if (mood <= 8) return 'bg-lime-100'
  return 'bg-green-100'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
