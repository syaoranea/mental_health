'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithRedirect, fetchAuthSession } from 'aws-amplify/auth';

export default function AuthTestPage() {
  const searchParams = useSearchParams();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [errorInfo, setErrorInfo] = useState<any>(null);

  useEffect(() => {
    async function check() {
      try {
        const session = await fetchAuthSession();
        console.log('SESSION /auth/test:', session);
        setSessionInfo(session);
      } catch (e: any) {
        console.error('SESSION ERROR /auth/test:', e);
        setErrorInfo({ name: e?.name, message: e?.message });
      }
    }
    check();
  }, [searchParams]);

  const loginGoogle = async () => {
    await signInWithRedirect({ provider: 'Google' });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>/auth/test</h1>
      <p>query: {window.location.search}</p>
      <button onClick={loginGoogle}>Login com Google (teste)</button>

      <h2>Sessão</h2>
      <pre style={{ whiteSpace: 'pre-wrap', maxWidth: 600 }}>
        {JSON.stringify(sessionInfo, null, 2)}
      </pre>

      <h2>Erro</h2>
      <pre style={{ whiteSpace: 'pre-wrap', maxWidth: 600 }}>
        {JSON.stringify(errorInfo, null, 2)}
      </pre>
    </div>
  );
}