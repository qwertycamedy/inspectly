import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthBootstrap } from '@/features/auth/auth-bootstrap';

export default function RootLayout() {
  return (
    <>
      <AuthBootstrap />
      <StatusBar style="dark" />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}