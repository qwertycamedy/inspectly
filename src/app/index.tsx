import { Redirect } from "expo-router";

import { FullScreenLoader } from "@/components/ui";
import { useAuthStore } from "@/features/auth/auth-store";

export default function IndexScreen() {
  const { session, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <FullScreenLoader />;
  }

  return <Redirect href={session ? "/inspections" : "/sign-in"} />;
}
