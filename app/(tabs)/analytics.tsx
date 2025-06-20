import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import SessionAnalytics from '@/components/analytics/SessionAnalytics';
import PageHeader from '@/components/ui/PageHeader';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="Session Analytics" />
      
      {user ? (
        <SessionAnalytics userId={user.id} showRealTime={true} />
      ) : (
        <View style={styles.noUserContainer}>
          <Text style={[styles.noUserText, { color: colors.textSecondary }]}>
            Please log in to view session analytics
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noUserText: {
    fontSize: 16,
    textAlign: 'center',
  },
});