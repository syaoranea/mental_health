// app/api/feature-toggles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToggles, getToggle } from '@/lib/feature-toggles'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const appId = searchParams.get('appId') || 'meuRefugio'
    const toggleName = searchParams.get('toggle')

    console.log(`[feature-toggles API] GET - appId: ${appId}, toggle: ${toggleName}`)

    if (toggleName) {
      const value = await getToggle(appId, toggleName)
      return NextResponse.json(
        {
          success: true,
          appId,
          toggle: toggleName,
          value,
        },
        { status: 200 }
      )
    }

    const toggles = await getToggles(appId)
    return NextResponse.json(
      {
        success: true,
        appId,
        toggles,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[feature-toggles API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar feature toggles',
        detail: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}
