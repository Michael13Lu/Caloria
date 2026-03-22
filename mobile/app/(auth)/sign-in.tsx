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
import { signInSchema, SignInFormData } from '../../src/lib/validation';
import { Button } from '../../src/shared/components/ui/Button';
import { Input } from '../../src/shared/components/ui/Input';
import { colors, spacing, typography } from '../../src/shared/constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setError('');
      await signIn(data.email, data.password);
    } catch (e: any) {
      setError(e.message ?? 'Sign in failed');
    }
  };

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🥗</Text>
            <Text style={styles.title}>Caloria</Text>
            <Text style={styles.subtitle}>Track calories. Build habits.</Text>
          </View>

          {/* Form */}
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
                  autoComplete="email"
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
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: { alignItems: 'center', gap: spacing.sm },
  logo: { fontSize: 56 },
  title: { ...typography.h1, color: colors.text, fontSize: 34 },
  subtitle: { ...typography.body, color: colors.textMuted },
  form: { gap: spacing.md },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center' },
  submitBtn: { marginTop: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: { ...typography.body, color: colors.textMuted },
  footerLink: { ...typography.bodyMd, color: colors.primary },
});
