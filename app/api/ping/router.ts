// app/api/ping/route.ts
export async function GET() {
  console.log('🔔 [API] /api/ping chamada')
  return Response.json({ ok: true })
}