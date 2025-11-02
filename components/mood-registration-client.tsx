
'use client'

import { useState } from 'react'
import { Heart, Save, Camera, Smile, Type, Sliders, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { EMOTION_OPTIONS, MOOD_WORDS } from '@/lib/types'
import { getMoodColorClass, getMoodBgColorClass } from '@/lib/utils'

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

interface MoodRegistrationData {
  categories: Array<{
    id: string
    name: string
    icon: string
    type: 'predefined' | 'custom'
    isCustom: boolean
  }>
  existingRecord: any | null
}

interface MoodRegistrationClientProps {
  data: MoodRegistrationData
}

export function MoodRegistrationClient({ data }: MoodRegistrationClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [moodScale, setMoodScale] = useState<number[]>(data.existingRecord?.numericScale ? [data.existingRecord.numericScale] : [5])
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>(data.existingRecord?.emojis || [])
  const [selectedWords, setSelectedWords] = useState<string[]>(data.existingRecord?.descriptiveWords || [])
  const [notes, setNotes] = useState(data.existingRecord?.notes || '')
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    data.existingRecord?.activities?.map((a: any) => a.categoryId) || []
  )
  const [isPrivate, setIsPrivate] = useState(data.existingRecord?.isPrivate || false)

  const handleEmojiToggle = (emoji: string) => {
    setSelectedEmojis(prev => 
      prev.includes(emoji) 
        ? prev.filter(e => e !== emoji)
        : [...prev, emoji]
    )
  }

  const handleWordToggle = (word: string) => {
    setSelectedWords(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    )
  }

  const handleActivityToggle = (categoryId: string) => {
    setSelectedActivities(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      const moodData = {
        numericScale: moodScale[0],
        emojis: selectedEmojis,
        descriptiveWords: selectedWords,
        notes: notes.trim() || null,
        isPrivate,
        activities: selectedActivities,
        existingId: data.existingRecord?.id || null
      }

      const response = await fetch('/api/mood-records', {
        method: data.existingRecord ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moodData),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Erro ao salvar registro')
        return
      }

      toast.success(data.existingRecord ? 'Registro atualizado!' : 'Registro salvo!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Erro ao salvar registro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentMood = moodScale[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.existingRecord ? 'Editar Registro' : 'Como você está hoje?'}
          </h1>
          <p className="text-gray-600">
            {data.existingRecord 
              ? 'Atualize seu registro de humor e atividades'
              : 'Registre seu humor e atividades do dia de forma simples e completa'
            }
          </p>
        </div>

        <div className="space-y-8">
          {/* Mood Scale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                Escala de Humor
              </CardTitle>
              <CardDescription>
                Como você se sente numa escala de 1 a 10?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="px-4">
                <Slider
                  value={moodScale}
                  onValueChange={setMoodScale}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1 - Muito mal</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getMoodBgColorClass(currentMood)} mb-2`}>
                  <span className={`text-3xl font-bold ${getMoodColorClass(currentMood)}`}>
                    {currentMood}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {currentMood <= 3 && 'Você parece estar passando por um momento difícil'}
                  {currentMood > 3 && currentMood <= 6 && 'Seu humor está moderado hoje'}
                  {currentMood > 6 && currentMood <= 8 && 'Você está se sentindo bem!'}
                  {currentMood > 8 && 'Que dia excelente!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emotions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary" />
                Emoções
              </CardTitle>
              <CardDescription>
                Escolha os emojis que melhor descrevem como você se sente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {EMOTION_OPTIONS.map((emotion) => (
                  <button
                    key={emotion.value}
                    onClick={() => handleEmojiToggle(emotion.emoji)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      selectedEmojis.includes(emotion.emoji)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{emotion.emoji}</span>
                    <span className="text-xs text-gray-600">{emotion.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Descriptive Words */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" />
                Palavras Descritivas
              </CardTitle>
              <CardDescription>
                Selecione palavras que descrevem seus sentimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {MOOD_WORDS.map((word) => (
                  <Badge
                    key={word}
                    variant={selectedWords.includes(word) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleWordToggle(word)}
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Atividades
              </CardTitle>
              <CardDescription>
                Marque as atividades que você realizou hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={category.id}
                      checked={selectedActivities.includes(category.id)}
                      onCheckedChange={() => handleActivityToggle(category.id)}
                    />
                    <Label 
                      htmlFor={category.id}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                      {category.isCustom && (
                        <Badge variant="secondary" className="text-xs">
                          personalizada
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Pessoais</CardTitle>
              <CardDescription>
                Adicione observações, pensamentos ou detalhes sobre seu dia (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escreva aqui suas observações sobre o dia, sentimentos, eventos importantes..."
                className="min-h-24"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-2">
                {notes.length}/1000 caracteres
              </p>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="private"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(checked === true)}
                />
                <Label htmlFor="private" className="cursor-pointer flex-1">
                  <div className="font-medium">Registro privado</div>
                  <div className="text-sm text-gray-500">
                    Este registro não será compartilhado com ninguém que tenha acesso aos seus dados
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center pb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading 
                ? 'Salvando...' 
                : data.existingRecord 
                  ? 'Atualizar Registro' 
                  : 'Salvar Registro'
              }
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
