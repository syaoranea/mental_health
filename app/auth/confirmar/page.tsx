"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { confirmSignUp } from "aws-amplify/auth";

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await confirmSignUp({ username: email, confirmationCode: code });
      alert("Conta confirmada! Faça login.");
      router.push("/auth/entrar");
    } catch (error: any) {
      alert(error.message || "Erro ao confirmar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1>Confirmar cadastro</h1>
      <p>Email: {email}</p>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Código de verificação"
        className="border p-2 mt-4"
      />

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Confirmar
      </button>
    </div>
  );
}
