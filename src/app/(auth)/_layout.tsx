import { Redirect, Stack } from "expo-router";

import { FullScreenLoader } from "@/components/ui";
import { useAuthStore } from "@/features/auth/auth-store";

export default function AuthLayout() {
  const session = useAuthStore((state) => state.session);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <FullScreenLoader />;
  }

  if (session) {
    return <Redirect href="/inspections" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
