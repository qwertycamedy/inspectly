import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/components/ui";
import { useAuthStore } from "@/features/auth/auth-store";
import { supabase } from "@/lib";

export default function ProfileScreen() {
  const session = useAuthStore((state) => state.session);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = session?.user.email ?? "Unknown user";

  async function handleSignOut() {
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    setIsSigningOut(false);

    if (error) {
      Alert.alert("Could not sign out", "Please try again in a moment.");
    }
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {email.slice(0, 1).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.role}>INSPECTOR</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Workspace</Text>
        <Text style={styles.infoValue}>Inspectly Operations</Text>

        <View style={styles.divider} />

        <Text style={styles.infoTitle}>Environment</Text>
        <Text style={styles.infoValue}>Development</Text>
      </View>

      <Pressable
        disabled={isSigningOut}
        onPress={handleSignOut}
        style={[
          styles.signOutButton,
          isSigningOut && styles.signOutButtonDisabled,
        ]}
      >
        <Text style={styles.signOutText}>
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EAF2",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backButtonText: {
    color: "#172033",
    fontSize: 30,
    lineHeight: 31,
    marginTop: -4,
  },
  title: {
    color: "#172033",
    fontSize: 19,
    fontWeight: "800",
  },
  headerSpacer: {
    width: 44,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#172033",
    borderRadius: 24,
    marginTop: 26,
    padding: 24,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#3D5179",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  role: {
    color: "#8FAAFD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 16,
  },
  email: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8ECF3",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  infoTitle: {
    color: "#8993A3",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#263248",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
  },
  divider: {
    backgroundColor: "#EEF1F5",
    height: 1,
    marginVertical: 16,
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderColor: "#FFD8D9",
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 54,
  },
  signOutButtonDisabled: {
    opacity: 0.55,
  },
  signOutText: {
    color: "#C3373B",
    fontSize: 15,
    fontWeight: "800",
  },
});
