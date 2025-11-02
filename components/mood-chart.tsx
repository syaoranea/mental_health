
'use client'

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { formatDate, getMoodColor } from '@/lib/utils'
import { StatusMessage } from '@/components/ui/status-message'

interface MoodChartProps {
  data: any[]
  period: '7d' | '30d' | '90d'
}

export function MoodChart({ data, period }: MoodChartProps) {
  if (!data?.length) {
    return (
      <div className="h-64 flex items-center justify-center">
        <StatusMessage
          type="info"
          message="Nenhum registro encontrado. Que tal começar registrando seu humor hoje?"
        />
      </div>
    )
  }

  // Transform data for the chart
  const chartData = data
    .filter(mood => mood?.numericScale)
    .map(mood => ({
      date: formatDate(mood.date),
      mood: mood.numericScale,
      originalDate: new Date(mood.date),
      emotions: mood.emojis?.join(' ') || '',
      words: mood.descriptiveWords?.slice(0, 3)?.join(', ') || ''
    }))
    .reverse() // Show oldest to newest

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {label}
          </p>
          <p className="text-sm text-primary font-medium mb-1">
            Humor: {data.mood}/10
          </p>
          {data.emotions && (
            <p className="text-sm text-gray-600 mb-1">
              {data.emotions}
            </p>
          )}
          {data.words && (
            <p className="text-xs text-gray-500">
              {data.words}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[1, 10]}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#60B5FF"
            strokeWidth={3}
            dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#60B5FF', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
