import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/shared/constants/theme';

export default function FoodScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.title}>Food Catalog</Text>
        <Text style={styles.subtitle}>Search foods, create custom items, scan barcodes</Text>
        <Text style={styles.coming}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emoji: { fontSize: 64 },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  coming: { ...typography.label, color: colors.primary, textTransform: 'uppercase', marginTop: spacing.sm },
});
