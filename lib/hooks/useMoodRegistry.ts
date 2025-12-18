import { useState } from 'react'

export interface RegistroHumorInput {
  descriptorId: string
  emoji: string
  label: string
  notes: string
  timestamp: string
}

export interface RegistroHumor {
  registroId: string
  userId: string
  descriptorId: string
  emoji: string
  label: string
  notes: string
  timestamp: string
  createdAt: string
}

export function useMoodRegistry(idToken: string | null) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRegistro = async (input: RegistroHumorInput) => {
    if (!idToken) {
      return { success: false, error: 'Token de autenticação não encontrado' }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/mood-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(input),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar registro de humor')
      }

      return { success: true, registro: data.registro as RegistroHumor }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getRegistros = async (startDate?: string, endDate?: string) => {
    if (!idToken) {
      return { success: false, error: 'Token de autenticação não encontrado' }
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/mood-records?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar registros')
      }

      return { success: true, registros: data.registros as RegistroHumor[] }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    createRegistro,
    getRegistros,
    loading,
    error,
  }
}