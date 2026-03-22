import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { useDailyTarget } from '../../src/features/profile/hooks/useProfile';
import { Card } from '../../src/shared/components/ui/Card';
import { Button } from '../../src/shared/components/ui/Button';
import { colors, spacing, typography } from '../../src/shared/constants/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const target = useDailyTarget();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile summary */}
        {profile && (
          <Card style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>
                {profile.gender === 'male' ? '👨' : '👩'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileSub}>{user?.email}</Text>
            </View>
          </Card>
        )}

        {/* Stats */}
        {target && (
          <Card>
            <Text style={styles.sectionTitle}>Daily Target</Text>
            <View style={styles.targetRow}>
              <TargetItem label="Calories" value={`${target.calories}`} unit="kcal" />
              <TargetItem label="Protein" value={`${target.protein_g}`} unit="g" />
              <TargetItem label="Fat" value={`${target.fat_g}`} unit="g" />
              <TargetItem label="Carbs" value={`${target.carbs_g}`} unit="g" />
            </View>
          </Card>
        )}

        {/* Menu items */}
        <Card style={styles.menu}>
          <MenuItem
            emoji="👤"
            label="Edit Profile"
            onPress={() => router.push('/onboarding')}
          />
          <MenuItem emoji="🎯" label="Change Goal" onPress={() => router.push('/onboarding')} />
          <MenuItem emoji="🔔" label="Reminders" onPress={() => {}} />
        </Card>

        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleSignOut}
          style={styles.signOutBtn}
        />
      </View>
    </SafeAreaView>
  );
}

function TargetItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={targetStyles.item}>
      <Text style={targetStyles.value}>{value}</Text>
      <Text style={targetStyles.unit}>{unit}</Text>
      <Text style={targetStyles.label}>{label}</Text>
    </View>
  );
}

const targetStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', gap: 1 },
  value: { ...typography.h3, color: colors.text },
  unit: { ...typography.small, color: colors.textMuted },
  label: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
});

function MenuItem({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={menuStyles.item} activeOpacity={0.7}>
      <Text style={menuStyles.emoji}>{emoji}</Text>
      <Text style={menuStyles.label}>{label}</Text>
      <Text style={menuStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  emoji: { fontSize: 18, width: 28 },
  label: { ...typography.body, color: colors.text, flex: 1 },
  arrow: { fontSize: 20, color: colors.textMuted },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  title: { ...typography.h2, color: colors.text, paddingTop: spacing.sm },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  profileInfo: { gap: 2 },
  profileName: { ...typography.bodyMd, color: colors.text },
  profileSub: { ...typography.small, color: colors.textMuted },
  sectionTitle: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.sm },
  targetRow: { flexDirection: 'row' },
  menu: { gap: 0, paddingVertical: 0 },
  signOutBtn: { marginTop: 'auto' },
});
