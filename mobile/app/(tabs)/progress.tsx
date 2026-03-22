import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWeightLogs, useAddWeightLog } from '../../src/features/weight/hooks/useWeight';
import { weightLogSchema, WeightLogFormData } from '../../src/lib/validation';
import { Card } from '../../src/shared/components/ui/Card';
import { Input } from '../../src/shared/components/ui/Input';
import { Button } from '../../src/shared/components/ui/Button';
import { colors, spacing, typography } from '../../src/shared/constants/theme';
import { getTodayDate } from '../../src/lib/calorie-calculator';

export default function ProgressScreen() {
  const { data: logs = [], isLoading } = useWeightLogs(30);
  const addWeight = useAddWeightLog();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WeightLogFormData>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: { date: getTodayDate(), note: null },
  });

  const onSubmit = async (data: WeightLogFormData) => {
    await addWeight.mutateAsync(data);
    reset({ date: getTodayDate(), note: null });
  };

  const latestWeight = logs[0]?.weight_kg;
  const startWeight = logs[logs.length - 1]?.weight_kg;
  const change = latestWeight && startWeight ? latestWeight - startWeight : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>

        {/* Stats */}
        {latestWeight && (
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>{latestWeight} kg</Text>
            </Card>
            {change !== null && (
              <Card style={styles.statCard}>
                <Text style={styles.statLabel}>Change</Text>
                <Text style={[styles.statValue, { color: change <= 0 ? colors.success : colors.danger }]}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                </Text>
              </Card>
            )}
          </View>
        )}

        {/* Log weight form */}
        <Card>
          <Text style={styles.formTitle}>Log Weight</Text>
          <View style={styles.form}>
            <Controller
              control={control}
              name="weight_kg"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Weight (kg)"
                  placeholder="75.0"
                  keyboardType="numeric"
                  value={value?.toString()}
                  onChangeText={(v) => onChange(parseFloat(v) || undefined)}
                  error={errors.weight_kg?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Note (optional)"
                  placeholder="Morning, fasted"
                  value={value ?? ''}
                  onChangeText={(v) => onChange(v || null)}
                />
              )}
            />
            <Button
              title="Save"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
          </View>
        </Card>

        {/* History */}
        {logs.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>History</Text>
            {logs.map((log) => (
              <Card key={log.id} style={styles.logItem}>
                <Text style={styles.logDate}>{log.date}</Text>
                <Text style={styles.logWeight}>{log.weight_kg} kg</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text, paddingTop: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statLabel: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  statValue: { ...typography.h2, color: colors.text },
  formTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  form: { gap: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  logDate: { ...typography.body, color: colors.textMuted },
  logWeight: { ...typography.bodyMd, color: colors.text },
});
