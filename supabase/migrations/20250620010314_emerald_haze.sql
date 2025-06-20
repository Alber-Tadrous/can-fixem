/*
  # Session Tracking System Database Schema

  1. New Tables
    - `user_sessions` - Track user login sessions with detailed metadata
    - `session_events` - Log all user activities and events during sessions  
    - `security_alerts` - Track security-related alerts and suspicious activities

  2. Security
    - Enable RLS on all new tables
    - Add policies for users to manage their own session data
    - Add policies for reading session analytics
*/

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration BIGINT,
    login_method TEXT NOT NULL CHECK (login_method IN ('email', 'social', 'token')),
    login_success BOOLEAN NOT NULL DEFAULT true,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    location JSONB,
    page_views INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    user_actions INTEGER DEFAULT 0,
    idle_time INTEGER DEFAULT 0,
    security_flags TEXT[] DEFAULT '{}',
    logout_method TEXT CHECK (logout_method IN ('manual', 'timeout', 'forced', 'error')),
    logout_reason TEXT,
    cleanup_status TEXT NOT NULL DEFAULT 'pending' CHECK (cleanup_status IN ('pending', 'completed', 'failed')),
    concurrent_sessions INTEGER DEFAULT 1,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'idle', 'terminated', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_events table
CREATE TABLE IF NOT EXISTS session_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'page_view', 'api_call', 'user_action', 'security_check', 'idle', 'error')),
    event_subtype TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    location JSONB
);

-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('suspicious_activity', 'concurrent_login', 'location_change', 'token_mismatch', 'failed_validation', 'invalid_session', 'too_many_sessions', 'session_too_long')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_user_id ON session_events(user_id);
CREATE INDEX IF NOT EXISTS idx_session_events_timestamp ON session_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can manage their own sessions"
    ON user_sessions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for session_events  
CREATE POLICY "Users can manage their own session events"
    ON session_events
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for security_alerts
CREATE POLICY "Users can view their own security alerts"
    ON security_alerts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can create security alerts"
    ON security_alerts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security alerts"
    ON security_alerts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);