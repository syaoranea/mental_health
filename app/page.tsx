
import { redirect } from 'next/navigation'
/* import { authOptions } from '@/lib/auth-options'
 */import { HomePageClient } from '@/components/home-page-client'
import { fetchAuthSession } from 'aws-amplify/auth';

export default async function HomePage() {
  const session = await fetchAuthSession();

  if (session.tokens) {
    redirect('/dashboard');
  }

  return <HomePageClient />
}
