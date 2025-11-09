'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js'
import { toast } from 'sonner'

const poolData = {
  UserPoolId: 'us-east-1_MTpOnlI5f',
  ClientId: '2u6dkn6qb6cb35mmvk9nvf67au',
}

const userPool = new CognitoUserPool(poolData)

export default function ConfirmPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const user = new CognitoUser({ Username: email, Pool: userPool })

    user.confirmRegistration(code, true, (err, result) => {
      setLoading(false)
      if (err) {
        toast.error(err.message || 'Erro ao confirmar conta')
        return
      }

      toast.success('Conta confirmada com sucesso! 🎉')
      router.push('/auth/entrar')
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Confirmar Conta</h1>
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código de Confirmação</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="6 dígitos"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  )
}

