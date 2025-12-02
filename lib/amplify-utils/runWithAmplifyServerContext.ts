/* // lib/amplify-utils/runWithAmplifyServerContext.ts
import { fetchUserAttributes } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import config from '@/amplify_outputs.json';
import { cookies } from 'next/headers';

const { runWithAmplifyServerContext } = createServerRunner({ config });

export const getFetchUserAttr = async () => {
  try {
    const allCookies = cookies().getAll();
    console.log('🍪 Cookies no server:', allCookies);

    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchUserAttributes(contextSpec),
    });

    console.log('✅ Atributos do usuário:', currentUser);
    return currentUser;
  } catch (err: any) {
    console.log('❌ Erro em getFetchUserAttr:', err?.name, err?.message);
    return null;
  }
}; */