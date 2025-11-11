import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@pointwise/lib/auth';
import AuthPage from './components/auth/AuthPage';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return <AuthPage />;
}
