import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/shared/constants/theme';
import { ProfileStep } from '../../src/features/profile/components/ProfileStep';
import { GoalStep } from '../../src/features/profile/components/GoalStep';

const STEPS = ['profile', 'goal'] as const;
type Step = typeof STEPS[number];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');

  const stepIndex = STEPS.indexOf(step);
  const progress = (stepIndex + 1) / STEPS.length;

  const goNext = () => {
    if (step === 'profile') setStep('goal');
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>Step {stepIndex + 1} of {STEPS.length}</Text>
      </View>

      {step === 'profile' && <ProfileStep onNext={goNext} />}
      {step === 'goal' && <GoalStep onNext={goNext} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepIndicator: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  stepText: {
    ...typography.small,
    color: colors.textMuted,
  },
});
