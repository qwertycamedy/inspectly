import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Screen } from "@/components/ui";
import { supabase } from "@/lib";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (error) {
        setSubmitError(
          "Unable to sign in. Check your email and password, then try again.",
        );
      }
    } catch {
      setSubmitError(
        "Something went wrong. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.eyebrow}>INSPECTLY</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to review your assigned inspections and submit reports.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Inspector sign in</Text>

            <Text style={styles.label}>Work email</Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="you@company.com"
                  placeholderTextColor="#98A1B0"
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value}
                />
              )}
            />

            {errors.email ? (
              <Text style={styles.fieldError}>{errors.email.message}</Text>
            ) : null}

            <Text style={styles.label}>Password</Text>

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="current-password"
                  editable={!isSubmitting}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter your password"
                  placeholderTextColor="#98A1B0"
                  secureTextEntry
                  style={[styles.input, errors.password && styles.inputError]}
                  value={value}
                />
              )}
            />

            {errors.password ? (
              <Text style={styles.fieldError}>{errors.password.message}</Text>
            ) : null}

            {submitError ? (
              <View style={styles.submitErrorBox}>
                <Text style={styles.submitErrorText}>{submitError}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Access is provided by your organisation administrator.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 36,
    paddingTop: 36,
  },
  brandBlock: {
    marginBottom: 28,
  },
  logo: {
    alignItems: "center",
    backgroundColor: "#172033",
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    marginBottom: 20,
    width: 58,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  eyebrow: {
    color: "#2E5BFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    color: "#172033",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 5,
  },
  subtitle: {
    color: "#6E7787",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8ECF3",
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  formTitle: {
    color: "#263248",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
  },
  label: {
    color: "#4C596E",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#F8FAFD",
    borderColor: "#DFE5EF",
    borderRadius: 14,
    borderWidth: 1,
    color: "#263248",
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: "#DC3E42",
  },
  fieldError: {
    color: "#C3373B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  submitErrorBox: {
    backgroundColor: "#FFF1F1",
    borderColor: "#FFD7D8",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  submitErrorText: {
    color: "#B9363A",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#2E5BFF",
    borderRadius: 15,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 54,
  },
  submitButtonDisabled: {
    backgroundColor: "#AAB7D7",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    color: "#8A94A4",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 20,
    textAlign: "center",
  },
});
