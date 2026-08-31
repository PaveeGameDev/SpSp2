import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Placeholder for the log flow modal (Screen A: activity picker, Screen B: task
// detail). Built as a single route with internal step state rather than nested
// Expo Router screens — Expo Router's dismiss-vs-back semantics for a stack
// nested inside a modally-presented route are ambiguous (expo/expo#39332,
// expo/expo#33048), so "back to picker" vs "close the whole sheet" are just
// local state vs router.back() on this one screen. Filled in during Phase 3.
export default function LogScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Log an activity</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
  },
});
