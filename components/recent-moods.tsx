
'use client'

import { formatRelativeTime, getMoodBgColorClass, getMoodColorClass } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Camera } from 'lucide-react'
import { StatusMessage } from '@/components/ui/status-message'

interface RecentMoodsProps {
  moods: any[]
}

export function RecentMoods({ moods }: RecentMoodsProps) {
  if (!moods?.length) {
    return (
      <StatusMessage
        type="info"
        message="Nenhum registro encontrado. Comece registrando seu humor hoje!"
      />
    )
  }

  return (
    <div className="space-y-4">
      {moods.slice(0, 5).map((mood, index) => (
        <Card 
          key={mood.id} 
          className={`transition-all hover:shadow-md ${getMoodBgColorClass(mood.numericScale)}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatRelativeTime(mood.date)}
                    </span>
                  </div>
                  
                  {mood.numericScale && (
                    <Badge 
                      variant="outline" 
                      className={`${getMoodColorClass(mood.numericScale)} border-current`}
                    >
                      {mood.numericScale}/10
                    </Badge>
                  )}
                  
                  {mood.photos?.length > 0 && (
                    <Badge variant="outline" className="text-gray-500">
                      <Camera className="w-3 h-3 mr-1" />
                      {mood.photos.length}
                    </Badge>
                  )}
                </div>

                {/* Emotions */}
                {mood.emojis?.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {mood.emojis.map((emoji: string, emojiIndex: number) => (
                      <span key={emojiIndex} className="text-lg">
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}

                {/* Descriptive words */}
                {mood.descriptiveWords?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mood.descriptiveWords.slice(0, 3).map((word: string, wordIndex: number) => (
                      <span 
                        key={wordIndex}
                        className="px-2 py-1 bg-white/70 text-gray-700 text-xs rounded-full border"
                      >
                        {word}
                      </span>
                    ))}
                    {mood.descriptiveWords.length > 3 && (
                      <span className="px-2 py-1 bg-white/70 text-gray-500 text-xs rounded-full border">
                        +{mood.descriptiveWords.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes preview */}
                {mood.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {mood.notes}
                  </p>
                )}

                {/* Activities */}
                {mood.activities?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {mood.activities.slice(0, 3).map((activity: any, activityIndex: number) => (
                      <div 
                        key={activityIndex}
                        className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded-full border"
                      >
                        <span>{activity.category?.icon}</span>
                        <span>{activity.category?.name}</span>
                        {activity.completed && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                    ))}
                    {mood.activities.length > 3 && (
                      <span className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full border">
                        +{mood.activities.length - 3} atividades
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
