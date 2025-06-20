export interface SessionEvent {
  id: string;
  session_id: string;
  user_id: string;
  event_type: 'login' | 'logout' | 'page_view' | 'api_call' | 'user_action' | 'security_check' | 'idle' | 'error';
  event_subtype?: string;
  timestamp: string;
  data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  device_info?: DeviceInfo;
  location?: GeolocationData;
}

export interface DeviceInfo {
  platform: string;
  os: string;
  browser: string;
  screen_resolution: string;
  timezone: string;
  language: string;
}

export interface GeolocationData {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  region?: string;
}

export interface SessionData {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  login_method: 'email' | 'social' | 'token';
  login_success: boolean;
  ip_address: string;
  user_agent: string;
  device_info: DeviceInfo;
  location?: GeolocationData;
  page_views: number;
  api_calls: number;
  user_actions: number;
  idle_time: number;
  security_flags: string[];
  logout_method?: 'manual' | 'timeout' | 'forced' | 'error';
  logout_reason?: string;
  cleanup_status: 'pending' | 'completed' | 'failed';
  concurrent_sessions: number;
  last_activity: string;
  status: 'active' | 'idle' | 'terminated' | 'expired';
}

export interface SecurityAlert {
  id: string;
  session_id: string;
  user_id: string;
  alert_type: 'suspicious_activity' | 'concurrent_login' | 'location_change' | 'token_mismatch' | 'failed_validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
  action_taken?: string;
}