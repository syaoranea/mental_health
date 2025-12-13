'use client'

import { useEffect, useState } from 'react'
import { Heart, Save, Camera, Smile, Type, Sliders, Activity, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
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
import { EMOTION_OPTIONS} from '@/lib/types'
import { getMoodColorClass, getMoodBgColorClass } from '@/lib/utils'
import { fetchAuthSession } from 'aws-amplify/auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => <div className="h-16 bg-white border-b border-gray-200"></div>
})

export interface MoodRegistrationData {
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

interface ActivityItem {
  id: string
  name: string
  icon: string
  type: 'predefined' | 'custom'
  isCustom: boolean
}

interface EmotionItem {
  id: string
  emoji: string
  label: string
  value: string
  type: 'predefined' | 'custom'
  isCustom: boolean
  order?: number
}

export function MoodRegistrationClient({ data }: MoodRegistrationClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [moodScale, setMoodScale] = useState<number[]>(data.existingRecord?.numericScale ? [data.existingRecord.numericScale] : [5])
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>(data.existingRecord?.emojis || [])
  const [notes, setNotes] = useState(data.existingRecord?.notes || '')
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    data.existingRecord?.activities?.map((a: any) => a.categoryId) || []
  )
  const [isPrivate, setIsPrivate] = useState(data.existingRecord?.isPrivate || false)
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  
  // Sentimentos modal
  const [manageOpen, setManageOpen] = useState(false)
  const [managedWords, setManagedWords] = useState<string[]>([])
  const [newWord, setNewWord] = useState("")
  
  // Atividades
  const [categories, setCategories] = useState<ActivityItem[]>(data.categories)
  
  // Atividades modal
  const [manageActivitiesOpen, setManageActivitiesOpen] = useState(false)
  const [managedActivities, setManagedActivities] = useState<ActivityItem[]>([])
  const [newActivityName, setNewActivityName] = useState("")
  const [newActivityIcon, setNewActivityIcon] = useState("")

  // Feature toggle - Registro privado
  const [hidePrivateSection, setHidePrivateSection] = useState(false)

  // Emoções
  const [emotions, setEmotions] = useState<EmotionItem[]>(() => 
    EMOTION_OPTIONS.map((e, index) => ({
      id: e.value,
      emoji: e.emoji,
      label: e.label,
      value: e.value,
      type: 'predefined' as const,
      isCustom: false,
      order: index,
    }))
  )
  const [loadingEmotions, setLoadingEmotions] = useState(true)

  // Emoções modal
  const [manageEmotionsOpen, setManageEmotionsOpen] = useState(false)
  const [managedEmotions, setManagedEmotions] = useState<EmotionItem[]>([])
  const [newEmotionEmoji, setNewEmotionEmoji] = useState("")
  const [newEmotionLabel, setNewEmotionLabel] = useState("")

  // ──────────────────────────────────────────────────────────────
  // SENTIMENTOS
  // ──────────────────────────────────────────────────────────────
  const handleAddSentimento = () => {
    setManagedWords(words)
    setNewWord("")
    setManageOpen(true)
  }

  const handleEditSentimentos = () => {
    setManagedWords(words)
    setManageOpen(true)
  }

  const handleReorderSentimentos = () => {
    setManagedWords(words)
    setManageOpen(true)
  }

  const handleManagedChange = (index: number, value: string) => {
    setManagedWords(prev => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const handleManagedRemove = (index: number) => {
    setManagedWords(prev => prev.filter((_, i) => i !== index))
  }

  const moveManagedItem = (index: number, direction: "up" | "down") => {
    setManagedWords(prev => {
      const copy = [...prev]
      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= copy.length) return prev
      const temp = copy[index]
      copy[index] = copy[newIndex]
      copy[newIndex] = temp
      return copy
    })
  }

  const handleAddNewManagedWord = () => {
    const trimmed = newWord.trim()
    if (!trimmed) return
    setManagedWords(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setNewWord("")
  }

  const handleSaveManaged = async () => {
    try {
      const { tokens } = await fetchAuthSession()
      const idToken = tokens?.idToken?.toString()
      if (!idToken) throw new Error('sem token')

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      }

      const previous = words
      const current = managedWords

      const removed = previous.filter((w) => !current.includes(w))

      console.log('💾 [client] previous:', previous)
      console.log('💾 [client] current:', current)
      console.log('💾 [client] removed:', removed)

      await Promise.all(
        removed.map((text) =>
          fetch('/api/mood-words', {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ text }),
          })
        )
      )

      await Promise.all(
        current.map((text, index) =>
          fetch('/api/mood-words', {
            method: 'POST',
            headers,
            body: JSON.stringify({ text, order: index }),
          })
        )
      )

      setWords([...current])
      setSelectedWords((prev) => prev.filter((w) => current.includes(w)))
      setManageOpen(false)
      toast.success('Sentimentos salvos!')
    } catch (err) {
      console.error('❌ [client] Erro ao salvar sentimentos:', err)
      toast.error('Erro ao salvar sentimentos')
    }
  }

  // ──────────────────────────────────────────────────────────────
  // EMOÇÕES
  // ──────────────────────────────────────────────────────────────
  const handleAddEmocao = () => {
    setManagedEmotions([...emotions])
    setNewEmotionEmoji("")
    setNewEmotionLabel("")
    setManageEmotionsOpen(true)
  }

  const handleEditEmocoes = () => {
    setManagedEmotions([...emotions])
    setManageEmotionsOpen(true)
  }

  const handleReorderEmocoes = () => {
    setManagedEmotions([...emotions])
    setManageEmotionsOpen(true)
  }

  const handleManagedEmotionChange = (index: number, field: 'emoji' | 'label', value: string) => {
    setManagedEmotions(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleManagedEmotionRemove = (index: number) => {
    const emotion = managedEmotions[index]
    
    if (!emotion.isCustom) {
      toast.error('Não é possível excluir emoções pré-definidas')
      return
    }

    setManagedEmotions(prev => prev.filter((_, i) => i !== index))
  }

  const moveManagedEmotion = (index: number, direction: "up" | "down") => {
    setManagedEmotions(prev => {
      const copy = [...prev]
      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= copy.length) return prev
      const temp = copy[index]
      copy[index] = copy[newIndex]
      copy[newIndex] = temp
      return copy
    })
  }

  const handleAddNewManagedEmotion = () => {
    const emoji = newEmotionEmoji.trim() || '😊'
    const label = newEmotionLabel.trim()
    
    if (!label) return

    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')

    const newEmotion: EmotionItem = {
      id: `temp-${Date.now()}`,
      emoji,
      label,
      value,
      type: 'custom',
      isCustom: true,
      order: managedEmotions.length,
    }

    setManagedEmotions(prev => [...prev, newEmotion])
    setNewEmotionEmoji("")
    setNewEmotionLabel("")
  }

  const handleSaveManagedEmotions = async () => {
    try {
      const { tokens } = await fetchAuthSession()
      const idToken = tokens?.idToken?.toString()
      if (!idToken) throw new Error('sem token')

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      }

      const previous = emotions.filter(e => e.isCustom)
      const current = managedEmotions.filter(e => e.isCustom)

      // Emoções removidas (só customizadas)
      const removed = previous.filter(
        (p) => !current.find((c) => c.id === p.id)
      )

      // Emoções novas (id começa com 'temp-')
      const added = current.filter((c) => c.id.startsWith('temp-'))

      // Emoções editadas (emoji ou label mudou)
      const edited = current.filter((c) => {
        if (c.id.startsWith('temp-')) return false
        const prev = previous.find((p) => p.id === c.id)
        return prev && (prev.emoji !== c.emoji || prev.label !== c.label)
      })

      console.log('💾 [client] emotions removed:', removed)
      console.log('💾 [client] emotions added:', added)
      console.log('💾 [client] emotions edited:', edited)

      // DELETE
      await Promise.all(
        removed.map((em) =>
          fetch('/api/emotions', {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ id: em.id }),
          })
        )
      )

      // POST (criar novas)
      const createdEmotions = await Promise.all(
        added.map(async (em, idx) => {
          const res = await fetch('/api/emotions', {
            method: 'POST',
            headers,
            body: JSON.stringify({ 
              emoji: em.emoji, 
              label: em.label,
              order: managedEmotions.findIndex(m => m.id === em.id),
            }),
          })
          const json = await res.json()
          return json.emotion
        })
      )

      // PUT (editar existentes)
      await Promise.all(
        edited.map((em) =>
          fetch('/api/emotions', {
            method: 'PUT',
            headers,
            body: JSON.stringify({ 
              id: em.id, 
              emoji: em.emoji, 
              label: em.label,
              order: managedEmotions.findIndex(m => m.id === em.id),
            }),
          })
        )
      )

      // Atualizar estado local - manter predefinidas + customizadas atualizadas
      const predefined = managedEmotions.filter(e => !e.isCustom)
      let customUpdated = current.filter((c) => !c.id.startsWith('temp-'))
      customUpdated = [...customUpdated, ...createdEmotions.filter(Boolean)]

      const updatedEmotions = [...predefined, ...customUpdated]
      
      setEmotions(updatedEmotions)
      setSelectedEmojis((prev) =>
        prev.filter((emoji) => updatedEmotions.find((e) => e.emoji === emoji))
      )
      setManageEmotionsOpen(false)
      toast.success('Emoções salvas!')
    } catch (err) {
      console.error('❌ [client] Erro ao salvar emoções:', err)
      toast.error('Erro ao salvar emoções')
    }
  }

  // ──────────────────────────────────────────────────────────────
  // ATIVIDADES
  // ──────────────────────────────────────────────────────────────
  const handleAddAtividade = () => {
    setManagedActivities([...categories])
    setNewActivityName("")
    setNewActivityIcon("")
    setManageActivitiesOpen(true)
  }

  const handleEditAtividades = () => {
    setManagedActivities([...categories])
    setManageActivitiesOpen(true)
  }

  const handleReorderAtividades = () => {
    setManagedActivities([...categories])
    setManageActivitiesOpen(true)
  }

  const handleManagedActivityChange = (index: number, field: 'name' | 'icon', value: string) => {
    setManagedActivities(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleManagedActivityRemove = async (index: number) => {
    const activity = managedActivities[index]
    
    // Só permite deletar atividades customizadas
    if (!activity.isCustom) {
      toast.error('Não é possível excluir atividades pré-definidas')
      return
    }

    setManagedActivities(prev => prev.filter((_, i) => i !== index))
  }

  const moveManagedActivity = (index: number, direction: "up" | "down") => {
    setManagedActivities(prev => {
      const copy = [...prev]
      const newIndex = direction === "up" ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= copy.length) return prev
      const temp = copy[index]
      copy[index] = copy[newIndex]
      copy[newIndex] = temp
      return copy
    })
  }

  const handleAddNewManagedActivity = () => {
    const name = newActivityName.trim()
    const icon = newActivityIcon.trim() || '📝'
    
    if (!name) return

    const newActivity: ActivityItem = {
      id: `temp-${Date.now()}`, // ID temporário, será substituído pelo backend
      name,
      icon,
      type: 'custom',
      isCustom: true,
    }

    setManagedActivities(prev => [...prev, newActivity])
    setNewActivityName("")
    setNewActivityIcon("")
  }

  const handleSaveManagedActivities = async () => {
    try {
      const { tokens } = await fetchAuthSession()
      const idToken = tokens?.idToken?.toString()
      if (!idToken) throw new Error('sem token')

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      }

      const previous = categories
      const current = managedActivities

      // Atividades removidas (só customizadas)
      const removed = previous.filter(
        (p) => p.isCustom && !current.find((c) => c.id === p.id)
      )

      // Atividades novas (id começa com 'temp-')
      const added = current.filter((c) => c.id.startsWith('temp-'))

      // Atividades editadas (nome ou ícone mudou)
      const edited = current.filter((c) => {
        if (c.id.startsWith('temp-')) return false
        const prev = previous.find((p) => p.id === c.id)
        return prev && (prev.name !== c.name || prev.icon !== c.icon)
      })

      console.log('💾 [client] removed:', removed)
      console.log('💾 [client] added:', added)
      console.log('💾 [client] edited:', edited)

      // DELETE
      await Promise.all(
        removed.map((act) =>
          fetch('/api/activities', {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ id: act.id }),
          })
        )
      )

      // POST (criar novas)
      const createdActivities = await Promise.all(
        added.map(async (act) => {
          const res = await fetch('/api/activities', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: act.name, icon: act.icon }),
          })
          const json = await res.json()
          return json.activity // retorna { id, name, icon, type, isCustom }
        })
      )

      // PUT (editar existentes)
      await Promise.all(
        edited.map((act) =>
          fetch('/api/activities', {
            method: 'PUT',
            headers,
            body: JSON.stringify({ id: act.id, name: act.name, icon: act.icon }),
          })
        )
      )

      // Atualizar estado local
      let updatedCategories = current.filter((c) => !c.id.startsWith('temp-'))
      updatedCategories = [...updatedCategories, ...createdActivities]

      setCategories(updatedCategories)
      setSelectedActivities((prev) =>
        prev.filter((id) => updatedCategories.find((c) => c.id === id))
      )
      setManageActivitiesOpen(false)
      toast.success('Atividades salvas!')
    } catch (err) {
      console.error('❌ [client] Erro ao salvar atividades:', err)
      toast.error('Erro ao salvar atividades')
    }
  }

  // ──────────────────────────────────────────────────────────────
  // FETCH INICIAL
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const { tokens } = await fetchAuthSession()
        const idToken = tokens?.idToken?.toString()

        const headers: HeadersInit = {}
        if (idToken) {
          headers['Authorization'] = `Bearer ${idToken}`
        }
        
        const res = await fetch('/api/mood-words', { headers })
        const data = await res.json()
        
        const resActivities = await fetch('/api/activities', { headers })
        const dataActivities = await resActivities.json()
        
        if (dataActivities.success && Array.isArray(dataActivities.activities)) {
          setCategories(dataActivities.activities)
        }

        if (data.success && data.words) {
          setWords(data.words)
        } else {
          console.error('Erro ao carregar palavras:', data.error)
        }

        // Fetch emoções customizadas
        try {
          const resEmotions = await fetch('/api/emotions', { headers })
          const dataEmotions = await resEmotions.json()
          console.log('🔍 emotions from API:', dataEmotions)
          
          if (dataEmotions.success && Array.isArray(dataEmotions.emotions)) {
            // Combinar emoções predefinidas com customizadas
            const predefinedEmotions: EmotionItem[] = EMOTION_OPTIONS.map((e, index) => ({
              id: e.value,
              emoji: e.emoji,
              label: e.label,
              value: e.value,
              type: 'predefined' as const,
              isCustom: false,
              order: index,
            }))
            
            const customEmotions: EmotionItem[] = dataEmotions.emotions.map((e: any) => ({
              id: e.id || e.emotionId,
              emoji: e.emoji,
              label: e.label,
              value: e.value,
              type: 'custom' as const,
              isCustom: true,
              order: e.order ?? 999,
            }))
            
            setEmotions([...predefinedEmotions, ...customEmotions])
          }
        } catch (emotionsError) {
          console.error('Erro ao buscar emoções:', emotionsError)
        }

        // Fetch feature toggle for registro privado
        try {
          const resToggle = await fetch('/api/feature-toggles?toggle=registroPrivado')
          const dataToggle = await resToggle.json()
          console.log('🔍 feature toggle registroPrivado:', dataToggle)
          if (dataToggle.success && dataToggle.value === true) {
            setHidePrivateSection(true)
          }
        } catch (toggleError) {
          console.error('Erro ao buscar feature toggle:', toggleError)
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
        setLoadingActivities(false)
        setLoadingEmotions(false)
      }
    }

    fetchData()
  }, [])

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
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  <span>Emoções</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 rounded-full p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddEmocao}>
                      Adicionar emoções
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEditEmocoes}>
                      Editar emoções
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReorderEmocoes}>
                      Reordenar emoções
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
              <CardDescription>
                Escolha os emojis que melhor descrevem como você se sente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEmotions ? (
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion.id}
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
              )}
            </CardContent>
          </Card>

          {/* Modal Emoções */}
          <Dialog open={manageEmotionsOpen} onOpenChange={setManageEmotionsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gerenciar emoções</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Emoji"
                    value={newEmotionEmoji}
                    onChange={(e) => setNewEmotionEmoji(e.target.value)}
                    className="w-20 text-center"
                  />
                  <Input
                    placeholder="Nome da emoção"
                    value={newEmotionLabel}
                    onChange={(e) => setNewEmotionLabel(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddNewManagedEmotion()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddNewManagedEmotion}>
                    Adicionar
                  </Button>
                </div>

                {managedEmotions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma emoção cadastrada ainda.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {managedEmotions.map((emotion, index) => (
                      <div
                        key={emotion.id + index}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={emotion.emoji}
                          onChange={(e) =>
                            handleManagedEmotionChange(index, 'emoji', e.target.value)
                          }
                          className="w-16 text-center"
                          disabled={!emotion.isCustom}
                        />
                        <Input
                          value={emotion.label}
                          onChange={(e) =>
                            handleManagedEmotionChange(index, 'label', e.target.value)
                          }
                          className="flex-1"
                          disabled={!emotion.isCustom}
                        />
                        {emotion.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            custom
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => moveManagedEmotion(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => moveManagedEmotion(index, "down")}
                            disabled={index === managedEmotions.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => handleManagedEmotionRemove(index)}
                            disabled={!emotion.isCustom}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManageEmotionsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSaveManagedEmotions}>
                  Salvar alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Descriptive Words */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  <span>Palavras Descritivas</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 rounded-full p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddSentimento}>
                      Adicionar sentimentos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEditSentimentos}>
                      Editar sentimentos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReorderSentimentos}>
                      Reordenar sentimentos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>

              <CardDescription>
                Selecione palavras que descrevem seus sentimentos
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {words.map((word) => (
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
              )}
            </CardContent>
          </Card>

          {/* Modal Sentimentos */}
          <Dialog open={manageOpen} onOpenChange={setManageOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Gerenciar sentimentos</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Novo sentimento"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddNewManagedWord()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddNewManagedWord}>
                    Adicionar
                  </Button>
                </div>

                {managedWords.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum sentimento cadastrado ainda.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {managedWords.map((word, index) => (
                      <div
                        key={word + index}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={word}
                          onChange={(e) =>
                            handleManagedChange(index, e.target.value)
                          }
                          className="flex-1"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => moveManagedItem(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => moveManagedItem(index, "down")}
                            disabled={index === managedWords.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => handleManagedRemove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManageOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSaveManaged}>
                  Salvar alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Atividades</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 rounded-full p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddAtividade}>
                      Adicionar atividades
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEditAtividades}>
                      Editar atividades
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleReorderAtividades}>
                      Reordenar atividades
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
              <CardDescription>
                Marque as atividades que você realizou hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActivities ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => (
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
                        <span className="text-sm">{category.name}</span>
                        
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal Atividades */}
          <Dialog open={manageActivitiesOpen} onOpenChange={setManageActivitiesOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gerenciar atividades</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da atividade"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Ícone (emoji)"
                    value={newActivityIcon}
                    onChange={(e) => setNewActivityIcon(e.target.value)}
                    className="w-24"
                  />
                  <Button type="button" onClick={handleAddNewManagedActivity}>
                    Adicionar
                  </Button>
                </div>

                {managedActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade cadastrada ainda.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {managedActivities.map((activity, index) => (
                      <div
                        key={activity.id + index}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={activity.icon}
                          onChange={(e) =>
                            handleManagedActivityChange(index, 'icon', e.target.value)
                          }
                          className="w-16 text-center"
                          disabled={!activity.isCustom}
                        />
                        <Input
                          value={activity.name}
                          onChange={(e) =>
                            handleManagedActivityChange(index, 'name', e.target.value)
                          }
                          className="flex-1"
                          disabled={!activity.isCustom}
                        />
                        {activity.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            custom
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => moveManagedActivity(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => moveManagedActivity(index, "down")}
                            disabled={index === managedActivities.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => handleManagedActivityRemove(index)}
                            disabled={!activity.isCustom}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManageActivitiesOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSaveManagedActivities}>
                  Salvar alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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

          {/* Privacy - conditionally rendered based on feature toggle */}
          {!hidePrivateSection && (
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
          )}

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
