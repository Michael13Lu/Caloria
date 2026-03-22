import { Redirect } from 'expo-router';
import { useAuth } from '../src/features/auth/hooks/useAuth';
import { useProfile } from '../src/features/profile/hooks/useProfile';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: profile } = useProfile();

  if (isLoading) return null;

  if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;
  if (!profile) return <Redirect href="/onboarding" />;

  return <Redirect href="/(tabs)" />;
}
