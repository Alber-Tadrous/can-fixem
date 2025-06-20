import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { supabase } from '@/lib/supabase';
import { SessionData, SessionEvent, SecurityAlert } from '@/types/session';
import { Clock, Activity, Shield, TriangleAlert as AlertTriangle, Eye, Zap } from 'lucide-react-native';

interface SessionAnalyticsProps {
  userId?: string;
  showRealTime?: boolean;
}

export default function SessionAnalytics({ userId, showRealTime = true }: SessionAnalyticsProps) {
  const { colors } = useTheme();
  const { sessionId, isActive, sessionDuration, activityStats } = useSessionTracking();
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [recentEvents, setRecentEvents] = useState<SessionEvent[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSessionData();
    }
  }, [userId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);

      // Load session history
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(10);

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError);
      } else {
        setSessionHistory(sessions || []);
      }

      // Load recent events
      const { data: events, error: eventsError } = await supabase
        .from('session_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (eventsError) {
        console.error('Error loading events:', eventsError);
      } else {
        setRecentEvents(events || []);
      }

      // Load security alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('resolved', false)
        .order('timestamp', { ascending: false });

      if (alertsError) {
        console.error('Error loading alerts:', alertsError);
      } else {
        setSecurityAlerts(alerts || []);
      }

    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login': return <Shield size={16} color={colors.success} />;
      case 'logout': return <Shield size={16} color={colors.danger} />;
      case 'page_view': return <Eye size={16} color={colors.primary} />;
      case 'api_call': return <Zap size={16} color={colors.secondary} />;
      case 'user_action': return <Activity size={16} color={colors.text} />;
      case 'security_check': return <AlertTriangle size={16} color={colors.warning} />;
      default: return <Activity size={16} color={colors.textSecondary} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.danger;
      case 'high': return '#FF6B35';
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading session analytics...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Current Session */}
      {showRealTime && isActive && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Session</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Duration</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatDuration(sessionDuration)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Eye size={20} color={colors.secondary} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Page Views</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {activityStats.pageViews}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Zap size={20} color={colors.warning} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>API Calls</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {activityStats.apiCalls}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Activity size={20} color={colors.success} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Actions</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {activityStats.userActions}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.sessionId, { color: colors.textSecondary }]}>
            Session ID: {sessionId}
          </Text>
        </View>
      )}

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security Alerts</Text>
          
          {securityAlerts.map((alert) => (
            <View 
              key={alert.id} 
              style={[
                styles.alertItem, 
                { 
                  backgroundColor: getSeverityColor(alert.severity) + '10',
                  borderLeftColor: getSeverityColor(alert.severity)
                }
              ]}
            >
              <View style={styles.alertHeader}>
                <AlertTriangle size={16} color={getSeverityColor(alert.severity)} />
                <Text style={[styles.alertType, { color: colors.text }]}>
                  {alert.alert_type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={[styles.alertSeverity, { color: getSeverityColor(alert.severity) }]}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.alertDescription, { color: colors.textSecondary }]}>
                {alert.description}
              </Text>
              <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                {new Date(alert.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Events */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        
        {recentEvents.slice(0, 10).map((event) => (
          <View key={event.id} style={styles.eventItem}>
            <View style={styles.eventHeader}>
              {getEventIcon(event.event_type)}
              <Text style={[styles.eventType, { color: colors.text }]}>
                {event.event_type.replace('_', ' ')}
              </Text>
              {event.event_subtype && (
                <Text style={[styles.eventSubtype, { color: colors.textSecondary }]}>
                  ({event.event_subtype})
                </Text>
              )}
            </View>
            <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
              {new Date(event.timestamp).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Session History */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Session History</Text>
        
        {sessionHistory.map((session) => (
          <View key={session.id} style={styles.sessionItem}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionDate, { color: colors.text }]}>
                {new Date(session.start_time).toLocaleDateString()}
              </Text>
              <Text style={[styles.sessionStatus, { 
                color: session.status === 'active' ? colors.success : colors.textSecondary 
              }]}>
                {session.status}
              </Text>
            </View>
            
            <View style={styles.sessionStats}>
              <Text style={[styles.sessionStat, { color: colors.textSecondary }]}>
                Duration: {session.duration ? formatDuration(session.duration) : 'Active'}
              </Text>
              <Text style={[styles.sessionStat, { color: colors.textSecondary }]}>
                Views: {session.page_views}
              </Text>
              <Text style={[styles.sessionStat, { color: colors.textSecondary }]}>
                API: {session.api_calls}
              </Text>
            </View>
            
            <Text style={[styles.sessionDevice, { color: colors.textSecondary }]}>
              {session.device_info.browser} on {session.device_info.os}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  sessionId: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  alertItem: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
  },
  eventItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  eventSubtype: {
    fontSize: 12,
    marginLeft: 4,
  },
  eventTime: {
    fontSize: 12,
  },
  sessionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  sessionStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  sessionStat: {
    fontSize: 12,
  },
  sessionDevice: {
    fontSize: 12,
  },
});