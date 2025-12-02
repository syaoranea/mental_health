
import { redirect } from 'next/navigation'
/* import { authOptions } from '@/lib/auth-options'
 */
import { fetchAuthSession } from 'aws-amplify/auth';
import HomePageClient from '@/components/home-page-client';

export default async function HomePage() {

 

  return <HomePageClient />
}
