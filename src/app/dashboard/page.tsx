import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@pointwise/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Welcome back, {session.user?.name?.split(' ')[0] ?? 'User'}!
      </h1>
      <p>Your personalized productivity dashboard will appear here.</p>
    </div>
  );
}
