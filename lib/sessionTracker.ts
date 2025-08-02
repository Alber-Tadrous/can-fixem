import { supabase } from './supabase';
import { SessionEvent, SessionData, DeviceInfo, GeolocationData, SecurityAlert } from '@/types/session';
import { Platform } from 'react-native';
import { ENV_CONFIG, isBrowser, isServer, isSSR, safeWindowOperation } from '@/utils/environment';

class SessionTracker {
  private currentSessionId: string | null = null;
  private sessionStartTime: Date | null = null;
  private lastActivityTime: Date = new Date();
  private idleTimer: NodeJS.Timeout | null = null;
  private activityCounts = {
    pageViews: 0,
    apiCalls: 0,
    userActions: 0,
    idleTime: 0
  };
  private securityFlags: string[] = [];
  private isTracking = false;
  private isInitialized = false;
  private sessionCreated = false; // Track if session was successfully created in DB

  // Configuration
  private readonly IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute
  private readonly MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Only setup activity listeners if we're in a browser environment (not SSR)
    if (isBrowser() && !isSSR()) {
      this.setupActivityListeners();
    }
  }

  // Initialize session tracking
  async startSession(userId: string, loginMethod: 'email' | 'social' | 'token'): Promise<string> {
    try {
      console.log('📊 SessionTracker: Starting session for user:', userId);
      
      // Always generate a session ID for local tracking
      this.currentSessionId = this.generateSessionId();
      this.sessionStartTime = new Date();
      this.lastActivityTime = new Date();
      this.resetActivityCounts();
      this.securityFlags = [];
      this.sessionCreated = false; // Reset session creation flag
      
      console.log('📊 SessionTracker: Generated session ID:', this.currentSessionId);
      
      // Check if tables exist before proceeding with database operations
      const tablesExist = await this.checkTablesExist();
      if (!tablesExist) {
        console.warn('⚠️ SessionTracker: Session tables not found, using local tracking only');
        this.isTracking = false; // Disable database tracking if tables don't exist
        this.isInitialized = true; // But still initialize for local tracking
        return this.currentSessionId;
      }
      
      this.isTracking = true;
      this.isInitialized = true;

      const deviceInfo = await this.getDeviceInfo();
      const location = await this.getLocationInfo();
      const ipAddress = await this.getIPAddress();

      // Create session record
      const sessionData: Partial<SessionData> = {
        id: this.currentSessionId,
        user_id: userId,
        start_time: this.sessionStartTime.toISOString(),
        login_method: loginMethod,
        login_success: true,
        ip_address: ipAddress,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        device_info: deviceInfo,
        location: location,
        page_views: 0,
        api_calls: 0,
        user_actions: 0,
        idle_time: 0,
        security_flags: [],
        concurrent_sessions: await this.getConcurrentSessionCount(userId),
        last_activity: this.lastActivityTime.toISOString(),
        status: 'active',
        cleanup_status: 'pending'
      };

      console.log('📊 SessionTracker: Creating session record:', sessionData);

      // Store session in database with retry logic
      let sessionCreateAttempts = 0;
      const maxAttempts = 3;
      
      while (sessionCreateAttempts < maxAttempts && !this.sessionCreated) {
        try {
          const { error } = await supabase
            .from('user_sessions')
            .insert([sessionData]);

          if (error) {
            console.error(`❌ SessionTracker: Error creating session (attempt ${sessionCreateAttempts + 1}):`, error);
            sessionCreateAttempts++;
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log('✅ SessionTracker: Session created in database');
            this.sessionCreated = true;
            break;
          }
        } catch (insertError) {
          console.error(`❌ SessionTracker: Exception creating session (attempt ${sessionCreateAttempts + 1}):`, insertError);
          sessionCreateAttempts++;
          
          if (sessionCreateAttempts >= maxAttempts) {
            this.isTracking = false;
            this.sessionCreated = false;
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Only log events and start monitoring if session was successfully created
      if (this.sessionCreated) {
        // Log login event
        await this.logEvent('login', 'success', {
          login_method: loginMethod,
          device_info: deviceInfo,
          location: location,
          ip_address: ipAddress
        });

        // Start activity monitoring
        this.startActivityMonitoring();
      } else {
        console.warn('⚠️ SessionTracker: Session not created in database, events will not be logged');
      }

      console.log('✅ SessionTracker: Session started successfully:', this.currentSessionId);
      return this.currentSessionId;

    } catch (error) {
      console.error('❌ SessionTracker: Error starting session:', error);
      // Create a basic session ID even if tracking fails
      this.currentSessionId = this.generateSessionId();
      this.isTracking = false;
      this.sessionCreated = false;
      this.isInitialized = true; // Still initialize for local tracking
      return this.currentSessionId;
    }
  }

  // End session tracking
  async endSession(logoutMethod: 'manual' | 'timeout' | 'forced' | 'error', reason?: string): Promise<void> {
    if (!this.currentSessionId || !this.sessionStartTime) {
      console.warn('⚠️ SessionTracker: No active session to end');
      return;
    }

    try {
      console.log('📊 SessionTracker: Ending session:', this.currentSessionId);
      console.log('📊 SessionTracker: Logout method:', logoutMethod);
      console.log('📊 SessionTracker: Logout reason:', reason);
      console.log('📊 SessionTracker: Database tracking enabled:', this.isTracking);
      console.log('📊 SessionTracker: Session created in DB:', this.sessionCreated);
      
      const endTime = new Date();
      const duration = endTime.getTime() - this.sessionStartTime.getTime();

      // Only update database if tracking is enabled, initialized, AND session was created
      if (this.isTracking && this.isInitialized && this.sessionCreated) {
        console.log('📊 SessionTracker: Updating session in database...');
        console.log('📊 SessionTracker: Session ID to update:', this.currentSessionId);
        
        // Update session record with explicit session ID matching
        const updateData = {
          end_time: endTime.toISOString(),
          duration: duration,
          logout_method: logoutMethod,
          logout_reason: reason,
          page_views: this.activityCounts.pageViews,
          api_calls: this.activityCounts.apiCalls,
          user_actions: this.activityCounts.userActions,
          idle_time: this.activityCounts.idleTime,
          security_flags: this.securityFlags,
          status: 'terminated',
          cleanup_status: 'completed',
          updated_at: endTime.toISOString()
        };

        console.log('📊 SessionTracker: Update data:', updateData);

        const { data, error, count } = await supabase
          .from('user_sessions')
          .update(updateData)
          .eq('id', this.currentSessionId)
          .select();

        console.log('📊 SessionTracker: Update result - Error:', error);
        console.log('📊 SessionTracker: Update result - Data:', data);
        console.log('📊 SessionTracker: Update result - Count:', count);

        if (error) {
          console.error('❌ SessionTracker: Error updating session:', error);
        } else if (!data || data.length === 0) {
          console.warn('⚠️ SessionTracker: No session record was updated - session may not exist in database');
          console.warn('⚠️ SessionTracker: This could be due to:');
          console.warn('   - Session ID mismatch');
          console.warn('   - RLS policy blocking the update');
          console.warn('   - Session record was already deleted');
        } else {
          console.log('✅ SessionTracker: Session updated in database successfully');
        }

        // Log logout event only if session exists in database
        await this.logEvent('logout', logoutMethod, {
          logout_method: logoutMethod,
          logout_reason: reason,
          session_duration: duration,
          total_page_views: this.activityCounts.pageViews,
          total_api_calls: this.activityCounts.apiCalls,
          total_user_actions: this.activityCounts.userActions,
          total_idle_time: this.activityCounts.idleTime
        });
      } else {
        console.log('📊 SessionTracker: Database tracking disabled or session not created, ending local session only');
      }

      // Cleanup
      this.stopActivityMonitoring();
      
      // Store session info before clearing for final log
      const finalSessionId = this.currentSessionId;
      
      this.currentSessionId = null;
      this.sessionStartTime = null;
      this.isTracking = false;
      this.isInitialized = false;
      this.sessionCreated = false;
      this.resetActivityCounts();
      this.securityFlags = [];

      console.log('✅ SessionTracker: Session ended successfully:', finalSessionId);

    } catch (error) {
      console.error('❌ SessionTracker: Error ending session:', error);
      
      // Mark cleanup as failed if possible and session exists in DB
      if (this.currentSessionId && this.isTracking && this.sessionCreated) {
        try {
          console.log('📊 SessionTracker: Marking cleanup as failed for session:', this.currentSessionId);
          await supabase
            .from('user_sessions')
            .update({ 
              cleanup_status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', this.currentSessionId);
        } catch (updateError) {
          console.error('❌ SessionTracker: Error marking cleanup as failed:', updateError);
        }
      }
      
      // Still cleanup local state
      this.currentSessionId = null;
      this.sessionStartTime = null;
      this.isTracking = false;
      this.isInitialized = false;
      this.sessionCreated = false;
    }
  }

  // Check if session tracking tables exist
  private async checkTablesExist(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .select('id')
        .limit(1);
      
      if (error) {
        console.warn('⚠️ SessionTracker: Session tables check failed:', error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('⚠️ SessionTracker: Session tables do not exist:', error);
      return false;
    }
  }

  // Log various types of events - ONLY if session exists in database
  async logEvent(
    eventType: SessionEvent['event_type'], 
    subtype: string, 
    data: Record<string, any> = {}
  ): Promise<void> {
    // Update local activity counts regardless of database tracking
    this.updateActivityCounts(eventType);
    this.updateLastActivity();

    // Only log to database if tracking is enabled, initialized, AND session was created
    if (!this.currentSessionId || !this.isTracking || !this.isInitialized || !this.sessionCreated) {
      console.log(`📊 SessionTracker: Event ${eventType}:${subtype} tracked locally only (DB tracking disabled or session not created)`);
      return;
    }

    try {
      const event: Partial<SessionEvent> = {
        id: this.generateEventId(),
        session_id: this.currentSessionId,
        user_id: data.user_id || await this.getCurrentUserId(),
        event_type: eventType,
        event_subtype: subtype,
        timestamp: new Date().toISOString(),
        data: data,
        ip_address: await this.getIPAddress(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        device_info: await this.getDeviceInfo()
      };

      console.log('📊 SessionTracker: Logging event to database:', eventType, subtype);

      // Verify session exists before inserting event
      const { data: sessionExists, error: sessionCheckError } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('id', this.currentSessionId)
        .single();

      if (sessionCheckError || !sessionExists) {
        console.error('❌ SessionTracker: Session does not exist in database, cannot log event:', sessionCheckError);
        console.error('❌ SessionTracker: Session ID:', this.currentSessionId);
        console.error('❌ SessionTracker: Disabling database tracking for this session');
        this.sessionCreated = false;
        this.isTracking = false;
        return;
      }

      // Store event in database
      const { error } = await supabase
        .from('session_events')
        .insert([event]);

      if (error) {
        console.error('❌ SessionTracker: Error logging event:', error);
        console.error('❌ SessionTracker: Event data:', event);
        
        // If foreign key constraint violation, disable tracking for this session
        if (error.code === '23503') {
          console.error('❌ SessionTracker: Foreign key violation - session does not exist, disabling tracking');
          this.sessionCreated = false;
          this.isTracking = false;
        }
      } else {
        console.log('✅ SessionTracker: Event logged successfully');
      }

    } catch (error) {
      console.error('❌ SessionTracker: Error in logEvent:', error);
      
      // If this is a foreign key error, disable tracking
      if (error instanceof Error && error.message.includes('23503')) {
        console.error('❌ SessionTracker: Foreign key constraint error, disabling tracking');
        this.sessionCreated = false;
        this.isTracking = false;
      }
    }
  }

  // Track page views
  async trackPageView(route: string, params?: Record<string, any>): Promise<void> {
    await this.logEvent('page_view', 'navigation', {
      route: route,
      params: params,
      timestamp: new Date().toISOString()
    });
  }

  // Track API calls
  async trackAPICall(endpoint: string, method: string, status: number, duration: number): Promise<void> {
    await this.logEvent('api_call', method.toLowerCase(), {
      endpoint: endpoint,
      method: method,
      status_code: status,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
  }

  // Track user actions
  async trackUserAction(action: string, details?: Record<string, any>): Promise<void> {
    await this.logEvent('user_action', action, {
      action: action,
      details: details,
      timestamp: new Date().toISOString()
    });
  }

  // Security monitoring
  async checkSecurity(): Promise<void> {
    if (!this.currentSessionId || !this.isInitialized) return;

    try {
      // Check session validity
      const isValid = await this.validateSession();
      if (!isValid) {
        await this.flagSecurity('invalid_session', 'Session validation failed');
        return;
      }

      // Check for concurrent sessions (only if database tracking is enabled and session exists)
      if (this.isTracking && this.sessionCreated) {
        const concurrentCount = await this.getConcurrentSessionCount();
        if (concurrentCount > 3) {
          await this.flagSecurity('too_many_sessions', `${concurrentCount} concurrent sessions detected`);
        }
      }

      // Check session duration
      if (this.sessionStartTime) {
        const duration = Date.now() - this.sessionStartTime.getTime();
        if (duration > this.MAX_SESSION_DURATION) {
          await this.flagSecurity('session_too_long', 'Session exceeded maximum duration');
          await this.endSession('timeout', 'Maximum session duration exceeded');
        }
      }

      // Check for suspicious activity patterns
      await this.detectSuspiciousActivity();

    } catch (error) {
      console.error('❌ SessionTracker: Error in security check:', error);
    }
  }

  // Flag security issues
  private async flagSecurity(alertType: string, description: string): Promise<void> {
    this.securityFlags.push(`${alertType}:${Date.now()}`);
    
    // Only create database alert if tracking is enabled and session exists
    if (!this.isTracking || !this.isInitialized || !this.sessionCreated) {
      console.warn('⚠️ SessionTracker: Security flag recorded locally only:', alertType);
      return;
    }
    
    const alert: Partial<SecurityAlert> = {
      id: this.generateEventId(),
      session_id: this.currentSessionId!,
      user_id: await this.getCurrentUserId(),
      alert_type: alertType as any,
      severity: this.getSeverityLevel(alertType),
      description: description,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    try {
      await supabase.from('security_alerts').insert([alert]);
    } catch (error) {
      console.error('❌ SessionTracker: Error creating security alert:', error);
    }
    
    await this.logEvent('security_check', alertType, {
      alert_type: alertType,
      description: description,
      severity: alert.severity
    });
  }

  // Activity monitoring
  private setupActivityListeners(): void {
    // Skip during SSR
    if (isSSR()) {
      return;
    }

    safeWindowOperation(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        // Web-specific listeners
        document.addEventListener('click', () => this.updateLastActivity());
        document.addEventListener('keypress', () => this.updateLastActivity());
        document.addEventListener('scroll', () => this.updateLastActivity());
        document.addEventListener('mousemove', () => this.updateLastActivity());
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.logEvent('user_action', 'page_hidden', {});
          } else {
            this.logEvent('user_action', 'page_visible', {});
            this.updateLastActivity();
          }
        });
      }
    });
  }

  private startActivityMonitoring(): void {
    this.idleTimer = setInterval(() => {
      this.checkIdleStatus();
      this.checkSecurity();
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  private stopActivityMonitoring(): void {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private checkIdleStatus(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivityTime.getTime();
    
    if (timeSinceLastActivity > this.IDLE_TIMEOUT) {
      this.logEvent('idle', 'timeout', {
        idle_duration: timeSinceLastActivity,
        last_activity: this.lastActivityTime.toISOString()
      });
      
      // Auto-logout after extended idle
      this.endSession('timeout', 'User idle timeout');
    }
  }

  private updateLastActivity(): void {
    this.lastActivityTime = new Date();
    
    // Update session last activity in database (only if tracking is enabled and session exists)
    if (this.currentSessionId && this.isTracking && this.isInitialized && this.sessionCreated) {
      supabase
        .from('user_sessions')
        .update({ 
          last_activity: this.lastActivityTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentSessionId)
        .then(({ error }) => {
          if (error) {
            console.error('❌ SessionTracker: Error updating last activity:', error);
          }
        });
    }
  }

  private updateActivityCounts(eventType: SessionEvent['event_type']): void {
    switch (eventType) {
      case 'page_view':
        this.activityCounts.pageViews++;
        break;
      case 'api_call':
        this.activityCounts.apiCalls++;
        break;
      case 'user_action':
        this.activityCounts.userActions++;
        break;
      case 'idle':
        this.activityCounts.idleTime++;
        break;
    }
  }

  private resetActivityCounts(): void {
    this.activityCounts = {
      pageViews: 0,
      apiCalls: 0,
      userActions: 0,
      idleTime: 0
    };
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    if (isSSR()) {
      return {
        platform: 'server',
        os: 'unknown',
        browser: 'Unknown',
        screen_resolution: 'unknown',
        timezone: 'unknown',
        language: 'unknown'
      };
    }
    
    return safeWindowOperation(() => ({
      platform: Platform.OS,
      os: Platform.OS === 'web' ? (window.navigator?.platform || 'unknown') : Platform.OS,
      browser: Platform.OS === 'web' ? this.getBrowserInfo() : 'mobile-app',
      screen_resolution: Platform.OS === 'web' && window.screen ? `${window.screen.width}x${window.screen.height}` : 'unknown',
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown',
      language: window.navigator?.language || 'unknown'
    }), {
      platform: 'server',
      os: 'unknown',
      browser: 'Unknown',
      screen_resolution: 'unknown',
      timezone: 'unknown',
      language: 'unknown'
    });
  }

  private getBrowserInfo(): string {
    return safeWindowOperation(() => {
      if (!window.navigator) return 'Unknown';
      
      const userAgent = window.navigator.userAgent;
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari')) return 'Safari';
      if (userAgent.includes('Edge')) return 'Edge';
      return 'Unknown';
    }, 'Unknown');
  }

  private async getLocationInfo(): Promise<GeolocationData | undefined> {
    if (isSSR()) {
      return undefined;
    }
    
    try {
      return safeWindowOperation(() => {
        // Only get location if user grants permission and we're in a browser environment
        if (Platform.OS === 'web' && window.navigator?.geolocation) {
          return new Promise<GeolocationData | undefined>((resolve) => {
            window.navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                });
              },
              () => resolve(undefined), // Don't fail if location is denied
              { timeout: 5000 }
            );
          });
        }
        return undefined;
      }, undefined);
    } catch (error) {
      console.warn('⚠️ SessionTracker: Could not get location:', error);
    }
    return undefined;
  }

  private async getIPAddress(): Promise<string> {
    try {
      // In a real app, you might want to use a service to get the IP
      // For now, we'll use a placeholder
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  private async getConcurrentSessionCount(userId?: string): Promise<number> {
    if (!this.isTracking || !this.isInitialized || !this.sessionCreated) return 0;
    
    try {
      const targetUserId = userId || await this.getCurrentUserId();
      const { count } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('status', 'active');
      
      return count || 0;
    } catch (error) {
      console.error('❌ SessionTracker: Error getting concurrent session count:', error);
      return 0;
    }
  }

  private async validateSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  private async detectSuspiciousActivity(): Promise<void> {
    // Implement suspicious activity detection logic
    // This could include:
    // - Rapid API calls
    // - Unusual navigation patterns
    // - Multiple failed actions
    // - Geographic anomalies
  }

  private getSeverityLevel(alertType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'invalid_session': 'high',
      'too_many_sessions': 'medium',
      'session_too_long': 'low',
      'suspicious_activity': 'high',
      'location_change': 'medium',
      'token_mismatch': 'critical'
    };
    
    return severityMap[alertType] || 'low';
  }

  // Public getters
  get sessionId(): string | null {
    return this.currentSessionId;
  }

  get isActive(): boolean {
    return !!this.currentSessionId; // Return true if we have a session ID, regardless of tracking status
  }

  get sessionDuration(): number {
    if (!this.sessionStartTime) return 0;
    return Date.now() - this.sessionStartTime.getTime();
  }

  get activityStats() {
    return { ...this.activityCounts };
  }
}

// Export singleton instance
export const sessionTracker = new SessionTracker();