import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { signUpSchema, SignUpFormData } from '../../src/lib/validation';
import { Button } from '../../src/shared/components/ui/Button';
import { Input } from '../../src/shared/components/ui/Input';
import { colors, spacing, typography } from '../../src/shared/constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError('');
      await signUp(data.email, data.password);
      setDone(true);
    } catch (e: any) {
      setError(e.message ?? 'Sign up failed');
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneIcon}>📧</Text>
          <Text style={styles.doneTitle}>Check your email</Text>
          <Text style={styles.doneText}>
            We sent a confirmation link. Verify your email then sign in.
          </Text>
          <Button
            title="Go to Sign In"
            onPress={() => router.replace('/(auth)/sign-in')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your journey today</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="Min 8 characters"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              size="lg"
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  header: { gap: spacing.xs },
  backBtn: { marginBottom: spacing.sm },
  backText: { ...typography.body, color: colors.primary },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  form: { gap: spacing.md },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center' },
  submitBtn: { marginTop: spacing.sm },
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  doneIcon: { fontSize: 64 },
  doneTitle: { ...typography.h2, color: colors.text },
  doneText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
