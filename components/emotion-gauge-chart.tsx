'use client'

import { useMemo } from 'react'

interface MoodRecord {
  id: string
  date: string
  numericScale: number
  emojis?: string[]
  descriptiveWords?: string[]
}

interface EmotionGaugeChartProps {
  moods: MoodRecord[]
}

interface EmotionCount {
  word: string
  count: number
}

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6', '#f97316']

export function EmotionGaugeChart({ moods }: EmotionGaugeChartProps) {
  const { topEmotions, total } = useMemo(() => {
    if (!moods || moods.length === 0) {
      return { topEmotions: [] as EmotionCount[], total: 0 }
    }

    const allWords = moods.flatMap(m => m.descriptiveWords || [])
    if (allWords.length === 0) {
      return { topEmotions: [] as EmotionCount[], total: 0 }
    }

    const map = new Map<string, number>()

    allWords.forEach(w => {
      const key = w.trim()
      if (!key) return
      map.set(key, (map.get(key) || 0) + 1)
    })

    const allEmotions: EmotionCount[] = Array.from(map.entries()).map(([word, count]) => ({
      word,
      count,
    }))

    allEmotions.sort((a, b) => b.count - a.count)

    const topEmotions = allEmotions.slice(0, 5)
    const total = topEmotions.reduce((acc, e) => acc + e.count, 0)

    return { topEmotions, total }
  }, [moods])

  if (total === 0 || topEmotions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Nenhuma emoção registrada para exibir no gráfico.
      </div>
    )
  }

  // Semicírculo SVG (180 graus) - MAIOR
  const radius = 120
  const strokeWidth = 30
  const circumference = Math.PI * radius // metade do círculo
  const center = 150

  // Cada emoção ocupa uma fatia proporcional à sua contagem
  const segments = topEmotions.map((e) => ({
    ...e,
    pct: (e.count / total) * 100,
  }))

  // Comprimento (strokeDasharray) de cada segmento
  const lengths = segments.map(s => (s.pct / 100) * circumference)

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <svg
        width="320"
        height="200"
        viewBox="0 0 300 200"
        className="mb-4"
      >
        {/* Fundo cinza */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Segmentos por emoção */}
        {segments.map((segment, index) => {
          const length = lengths[index]
          const offset = -lengths.slice(0, index).reduce((acc, v) => acc + v, 0)
          const color = COLORS[index % COLORS.length]

          return (
            <path
              key={segment.word}
              d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${length} ${circumference}`}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
            />
          )
        })}

        {/* Texto central */}
        <text
          x={center}
          y={center - 15}
          textAnchor="middle"
          className="text-3xl font-bold fill-gray-900"
        >
          {total}
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          className="text-sm fill-gray-500"
        >
          ocorrências (top {topEmotions.length})
        </text>
      </svg>

      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {topEmotions.map((emotion, index) => (
          <div key={emotion.word} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-gray-700">
              {emotion.word} ({emotion.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}