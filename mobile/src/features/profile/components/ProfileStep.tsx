import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '../../../lib/validation';
import { useSaveProfile } from '../hooks/useProfile';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { colors, spacing, typography } from '../../../shared/constants/theme';
import type { ActivityLevel, Gender } from '../../../types';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { value: 'light', label: 'Light', desc: '1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
  { value: 'active', label: 'Active', desc: '6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Physical job + training' },
];

interface Props {
  onNext: () => void;
}

export function ProfileStep({ onNext }: Props) {
  const saveProfile = useSaveProfile();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: 'male',
      activity_level: 'moderate',
    },
  });

  const selectedGender = watch('gender');
  const selectedActivity = watch('activity_level');

  const onSubmit = async (data: ProfileFormData) => {
    await saveProfile.mutateAsync(data);
    onNext();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>We'll calculate your personal calorie target</Text>

        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Your Name"
              placeholder="John"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>GENDER</Text>
          <View style={styles.row}>
            {GENDERS.map((g) => (
              <Button
                key={g.value}
                title={g.label}
                variant={selectedGender === g.value ? 'primary' : 'secondary'}
                onPress={() => setValue('gender', g.value)}
                style={styles.halfBtn}
              />
            ))}
          </View>
        </View>

        {/* Birth date */}
        <Controller
          control={control}
          name="birth_date"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Date of Birth"
              placeholder="1990-01-15"
              value={value}
              onChangeText={onChange}
              error={errors.birth_date?.message}
            />
          )}
        />

        {/* Height */}
        <Controller
          control={control}
          name="height_cm"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Height (cm)"
              placeholder="175"
              keyboardType="numeric"
              value={value?.toString()}
              onChangeText={(v) => onChange(parseFloat(v) || undefined)}
              error={errors.height_cm?.message}
            />
          )}
        />

        {/* Weight */}
        <Controller
          control={control}
          name="weight_kg"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Current Weight (kg)"
              placeholder="75"
              keyboardType="numeric"
              value={value?.toString()}
              onChangeText={(v) => onChange(parseFloat(v) || undefined)}
              error={errors.weight_kg?.message}
            />
          )}
        />

        {/* Activity level */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>ACTIVITY LEVEL</Text>
          <View style={styles.activityList}>
            {ACTIVITY_LEVELS.map((a) => (
              <Button
                key={a.value}
                title={`${a.label}  ·  ${a.desc}`}
                variant={selectedActivity === a.value ? 'primary' : 'secondary'}
                onPress={() => setValue('activity_level', a.value)}
                style={styles.activityBtn}
              />
            ))}
          </View>
        </View>

        {saveProfile.error && (
          <Text style={styles.error}>{String(saveProfile.error)}</Text>
        )}

        <Button
          title="Continue →"
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          size="lg"
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: -spacing.sm },
  field: { gap: spacing.xs },
  fieldLabel: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  halfBtn: { flex: 1 },
  activityList: { gap: spacing.xs },
  activityBtn: { justifyContent: 'flex-start', paddingHorizontal: spacing.md },
  error: { ...typography.small, color: colors.danger, textAlign: 'center' },
  submitBtn: { marginTop: spacing.sm },
});
