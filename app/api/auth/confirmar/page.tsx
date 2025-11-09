'use client'
import { useState } from 'react'
import { confirmSignUp } from '@/lib/cognito'
import router from 'next/router'
import { toast } from 'sonner'

export default function ConfirmPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const onConfirm = async () => {
    try {
      await confirmSignUp(email, code)
      toast.success('Conta confirmada! Faça login!') 
      router.push('/login') 
    } catch (e: any) {
      toast.error('Erro na confirmação')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-3">
      <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Código" value={code} onChange={e=>setCode(e.target.value)} />
      <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={onConfirm}>Confirmar</button>
    </div>
  )
}
