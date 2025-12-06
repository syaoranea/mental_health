
export interface EmotionOption {
  emoji: string
  label: string
  value: string
}

export interface CategoryOption {
  id: string
  name: string
  icon: string
  type: 'predefined' | 'custom'
}

export interface MoodRecord {
  id: string
  date: Date
  numericScale?: number
  emojis: string[]
  descriptiveWords: string[]
  notes?: string
  photos: string[]
  isPrivate: boolean
  activities: ActivityRecord[]
}

export interface ActivityRecord {
  id: string
  categoryId: string
  notes?: string
  completed: boolean
  category: CategoryOption
}

export interface ShareStatus {
  id: string
  ownerName: string
  sharedWithEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED'
  invitedAt: Date
}

export interface ReminderSettings {
  id: string
  time: string
  isActive: boolean
  timezone: string
}

// Emotional states with emojis
export const EMOTION_OPTIONS: EmotionOption[] = [
  { emoji: '😊', label: 'Alegre', value: 'alegre' },
  { emoji: '😢', label: 'Triste', value: 'triste' },
  { emoji: '😰', label: 'Ansioso', value: 'ansioso' },
  { emoji: '😌', label: 'Calmo', value: 'calmo' },
  { emoji: '😠', label: 'Irritado', value: 'irritado' },
  { emoji: '🤗', label: 'Esperançoso', value: 'esperancoso' },
  { emoji: '😴', label: 'Cansado', value: 'cansado' },
  { emoji: '💪', label: 'Motivado', value: 'motivado' },
  { emoji: '😨', label: 'Assustado', value: 'assustado' },
  { emoji: '😎', label: 'Confiante', value: 'confiante' },
]

// Predefined activity categories
export const DEFAULT_CATEGORIES: Omit<CategoryOption, 'id'>[] = [
  { name: 'Autocuidado', icon: '🛀', type: 'predefined' },
  { name: 'Atividade Física', icon: '🏃', type: 'predefined' },
  { name: 'Socialização', icon: '👥', type: 'predefined' },
  { name: 'Trabalho/Estudos', icon: '📚', type: 'predefined' },
  { name: 'Lazer/Hobbies', icon: '🎨', type: 'predefined' },
]

// Descriptive mood words
export const MOOD_WORDS = [
  'esperança', 'gratidão', 'paze', 'felicidade', 'energia',
  'tristeza', 'ansiedade', 'stress', 'frustração', 'medo',
  'calma', 'otimismo', 'contentamento', 'serenidade', 'alegria',
  'preocupação', 'nervosismo', 'irritação', 'desânimo', 'solidão',
  'confiança', 'determinação', 'relaxamento', 'tranquilidade', 'equilíbrio'
]

export interface ChartDataPoint {
  date: string
  mood: number
  activities?: number
}


declare module "next-auth" {
  interface User {
    accessToken?: string
    idToken?: string
    refreshToken?: string
  }

  interface Session {
    accessToken?: string
    idToken?: string
  }

  interface JWT {
    accessToken?: string
    idToken?: string
    refreshToken?: string
  }
}
