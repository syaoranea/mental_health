
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEFAULT_CATEGORIES } from '../lib/types'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // Create test admin user
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'Usuário Teste',
      settings: {
        theme: 'light',
        notifications: true,
        privacy: 'private'
      }
    }
  })

  console.log('✅ Usuário admin criado:', adminUser.email)

  // Create default categories
  for (const categoryData of DEFAULT_CATEGORIES) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryData.name,
        userId: null
      }
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: categoryData.name,
          icon: categoryData.icon,
          type: 'predefined',
          isCustom: false,
          userId: null
        }
      })
    }
  }

  console.log('✅ Categorias padrão criadas')

  // Create sample mood records for the admin user
  const today = new Date()
  const sampleDates = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    sampleDates.push(date)
  }

  const sampleMoods = [8, 6, 7, 5, 9, 7, 6]
  const sampleEmojis = [['😊'], ['😌'], ['😊', '💪'], ['😰'], ['😊', '🤗'], ['😌'], ['😊']]
  const sampleWords = [
    ['felicidade', 'energia'],
    ['calma', 'paz'],
    ['motivado', 'otimismo'],
    ['ansiedade', 'preocupação'],
    ['alegria', 'esperança'],
    ['tranquilidade'],
    ['contentamento']
  ]

  for (let i = 0; i < sampleDates.length; i++) {
    await prisma.moodRecord.create({
      data: {
        userId: adminUser.id,
        date: sampleDates[i],
        numericScale: sampleMoods[i],
        emojis: sampleEmojis[i],
        descriptiveWords: sampleWords[i],
        notes: `Registro de humor do dia ${i + 1}. Sentindo-me ${sampleWords[i][0]}.`,
        isPrivate: false,
        photos: []
      }
    })
  }

  console.log('✅ Registros de humor de exemplo criados')

  // Create some activities for recent mood records
  const categories = await prisma.category.findMany({
    where: { type: 'predefined' }
  })

  const recentMoodRecords = await prisma.moodRecord.findMany({
    where: { userId: adminUser.id },
    take: 3,
    orderBy: { date: 'desc' }
  })

  for (const record of recentMoodRecords) {
    // Add 2-3 random activities per mood record
    const selectedCategories = categories.slice(0, Math.floor(Math.random() * 3) + 2)
    
    for (const category of selectedCategories) {
      await prisma.activity.create({
        data: {
          moodRecordId: record.id,
          categoryId: category.id,
          completed: Math.random() > 0.2, // 80% completion rate
          notes: `Atividade realizada: ${category.name.toLowerCase()}`
        }
      })
    }
  }

  console.log('✅ Atividades de exemplo criadas')

  // Create a reminder for the admin user
  await prisma.reminder.create({
    data: {
      userId: adminUser.id,
      time: '19:00',
      isActive: true,
      timezone: 'America/Sao_Paulo'
    }
  })

  console.log('✅ Lembrete criado')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro durante seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
