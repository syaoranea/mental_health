
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
/* import { authOptions } from '@/lib/auth-options'
 */

export const dynamic = 'force-dynamic'

/* export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { 
      numericScale, 
      emojis, 
      descriptiveWords, 
      notes, 
      isPrivate, 
      activities 
    } = await request.json()

    // Check if user already has a record for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingRecord = await prisma.moodRecord.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Você já tem um registro para hoje. Use a opção de editar.' },
        { status: 400 }
      )
    }

    // Create mood record
    const moodRecord = await prisma.moodRecord.create({
      data: {
        userId: session.user.id,
        date: new Date(),
        numericScale,
        emojis,
        descriptiveWords,
        notes,
        isPrivate,
        photos: []
      }
    })

    // Create activity records
    if (activities?.length > 0) {
      await prisma.activity.createMany({
        data: activities.map((categoryId: string) => ({
          moodRecordId: moodRecord.id,
          categoryId,
          completed: true
        }))
      })
    }

    return NextResponse.json(
      { 
        message: 'Registro criado com sucesso',
        id: moodRecord.id
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Mood record creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { 
      existingId,
      numericScale, 
      emojis, 
      descriptiveWords, 
      notes, 
      isPrivate, 
      activities 
    } = await request.json()

    if (!existingId) {
      return NextResponse.json(
        { error: 'ID do registro é obrigatório' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingRecord = await prisma.moodRecord.findFirst({
      where: {
        id: existingId,
        userId: session.user.id
      }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      )
    }

    // Update mood record
    const updatedRecord = await prisma.moodRecord.update({
      where: { id: existingId },
      data: {
        numericScale,
        emojis,
        descriptiveWords,
        notes,
        isPrivate
      }
    })

    // Delete existing activities and create new ones
    await prisma.activity.deleteMany({
      where: { moodRecordId: existingId }
    })

    if (activities?.length > 0) {
      await prisma.activity.createMany({
        data: activities.map((categoryId: string) => ({
          moodRecordId: existingId,
          categoryId,
          completed: true
        }))
      })
    }

    return NextResponse.json(
      { 
        message: 'Registro atualizado com sucesso',
        id: updatedRecord.id
      }
    )

  } catch (error) {
    console.error('Mood record update error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
 */