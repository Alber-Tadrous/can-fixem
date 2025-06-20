import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('🎯 API: Session start endpoint called');
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ API: No valid authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ API: Invalid token or user not found:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ API: User authenticated:', user.id);

    // Parse request body for additional session data
    const body = await request.json();
    const { 
      loginMethod = 'email',
      ipAddress,
      userAgent,
      deviceInfo = {},
      location 
    } = body;

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔄 API: Creating session with ID:', sessionId);

    // Check for existing active sessions
    const { data: existingSessions, error: sessionCheckError } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (sessionCheckError) {
      console.log('⚠️ API: Error checking existing sessions:', sessionCheckError);
    }

    const activeSessionCount = existingSessions?.length || 0;
    console.log('📊 API: Active sessions for user:', activeSessionCount);

    // Create new session record
    const sessionData = {
      id: sessionId,
      user_id: user.id,
      start_time: new Date().toISOString(),
      login_method: loginMethod,
      login_success: true,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      device_info: deviceInfo,
      location: location || null,
      concurrent_sessions: activeSessionCount + 1,
      status: 'active'
    };

    console.log('💾 API: Inserting session data:', { ...sessionData, device_info: 'object' });

    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (sessionError) {
      console.error('❌ API: Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: sessionError.message }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ API: Session created successfully:', session.id);

    // Log the login event
    const loginEventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const loginEventData = {
      id: loginEventId,
      session_id: sessionId,
      user_id: user.id,
      event_type: 'login',
      event_subtype: loginMethod,
      timestamp: new Date().toISOString(),
      data: {
        success: true,
        concurrent_sessions: activeSessionCount + 1,
        login_method: loginMethod
      },
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      device_info: deviceInfo,
      location: location || null
    };

    console.log('📝 API: Logging login event:', loginEventId);

    const { error: eventError } = await supabase
      .from('session_events')
      .insert([loginEventData]);

    if (eventError) {
      console.error('⚠️ API: Error logging login event:', eventError);
      // Don't fail the session creation if event logging fails
    } else {
      console.log('✅ API: Login event logged successfully');
    }

    // Check if too many concurrent sessions (optional security check)
    if (activeSessionCount >= 3) {
      const securityAlertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const alertData = {
        id: securityAlertId,
        session_id: sessionId,
        user_id: user.id,
        alert_type: 'too_many_sessions',
        severity: 'medium',
        description: `User has ${activeSessionCount + 1} concurrent sessions`,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      console.log('🚨 API: Creating security alert for too many sessions');

      const { error: alertError } = await supabase
        .from('security_alerts')
        .insert([alertData]);

      if (alertError) {
        console.error('⚠️ API: Error creating security alert:', alertError);
      }
    }

    console.log('🎉 API: Session start completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId,
        message: 'Session started successfully',
        concurrentSessions: activeSessionCount + 1
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('💥 API: Unexpected error in session start:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}