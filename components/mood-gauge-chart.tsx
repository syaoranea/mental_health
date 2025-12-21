'use client'

import { useMemo } from 'react'

interface MoodRecord {
  id: string
  date: string
  numericScale: number
}

interface MoodGaugeChartProps {
  moods: MoodRecord[]
}

export function MoodGaugeChart({ moods }: MoodGaugeChartProps) {
  const stats = useMemo(() => {
    if (!moods || moods.length === 0) {
      return { baixo: 0, medio: 0, alto: 0, total: 0 }
    }

    const validMoods = moods.filter(m => typeof m.numericScale === 'number' && !isNaN(m.numericScale))
    const total = validMoods.length

    const baixo = validMoods.filter(m => m.numericScale < 5).length
    const medio = validMoods.filter(m => m.numericScale >= 5 && m.numericScale < 8).length
    const alto = validMoods.filter(m => m.numericScale >= 8).length

    return { baixo, medio, alto, total }
  }, [moods])

  if (stats.total === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Nenhum registro para exibir no gráfico.
      </div>
    )
  }

  const baixoPct = (stats.baixo / stats.total) * 100
  const medioPct = (stats.medio / stats.total) * 100
  const altoPct = (stats.alto / stats.total) * 100

  // Semicírculo SVG (180 graus)
  const radius = 80
  const strokeWidth = 20
  const circumference = Math.PI * radius // metade do círculo
  const center = 100

  // Offsets para cada segmento
  const baixoLength = (baixoPct / 100) * circumference
  const medioLength = (medioPct / 100) * circumference
  const altoLength = (altoPct / 100) * circumference

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <svg
        width="220"
        height="130"
        viewBox="0 0 200 130"
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

        {/* Segmento Baixo (vermelho) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${baixoLength} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />

        {/* Segmento Médio (amarelo) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#eab308"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${medioLength} ${circumference}`}
          strokeDashoffset={-baixoLength}
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
        />

        {/* Segmento Alto (verde) */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${altoLength} ${circumference}`}
          strokeDashoffset={-(baixoLength + medioLength)}
          style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
        />

        {/* Texto central */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="text-2xl font-bold fill-gray-900"
        >
          {stats.total}
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          registros
        </text>
      </svg>

      {/* Legenda */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-700">
            Baixo ({stats.baixo})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-700">
            Médio ({stats.medio})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-700">
            Alto ({stats.alto})
          </span>
        </div>
      </div>
    </div>
  )
}