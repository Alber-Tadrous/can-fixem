import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('🔚 API: Session end endpoint called');
    
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

    console.log('✅ API: User authenticated for session end:', user.id);

    // Parse request body
    const body = await request.json();
    const { 
      sessionId,
      logoutMethod = 'manual',
      logoutReason,
      activityCounts = {}
    } = body;

    if (!sessionId) {
      console.log('❌ API: Missing sessionId');
      return new Response(
        JSON.stringify({ error: 'Missing sessionId' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🔚 API: Ending session:', sessionId, 'Method:', logoutMethod);

    // Verify session exists and belongs to user
    const { data: session, error: sessionCheckError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionCheckError || !session) {
      console.error('❌ API: Session does not exist or does not belong to user:', sessionCheckError);
      return new Response(
        JSON.stringify({ error: 'Invalid session' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const endTime = new Date();
    const duration = endTime.getTime() - new Date(session.start_time).getTime();

    // Update session record
    const sessionUpdateData = {
      end_time: endTime.toISOString(),
      duration: duration,
      logout_method: logoutMethod,
      logout_reason: logoutReason || null,
      status: 'terminated',
      cleanup_status: 'completed',
      updated_at: endTime.toISOString(),
      // Update activity counts if provided
      ...(activityCounts.pageViews && { page_views: activityCounts.pageViews }),
      ...(activityCounts.apiCalls && { api_calls: activityCounts.apiCalls }),
      ...(activityCounts.userActions && { user_actions: activityCounts.userActions }),
      ...(activityCounts.idleTime && { idle_time: activityCounts.idleTime })
    };

    console.log('💾 API: Updating session with end data');

    const { error: sessionUpdateError } = await supabase
      .from('user_sessions')
      .update(sessionUpdateData)
      .eq('id', sessionId);

    if (sessionUpdateError) {
      console.error('❌ API: Error updating session:', sessionUpdateError);
      return new Response(
        JSON.stringify({ error: 'Failed to end session', details: sessionUpdateError.message }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Log the logout event
    const logoutEventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const logoutEventData = {
      id: logoutEventId,
      session_id: sessionId,
      user_id: user.id,
      event_type: 'logout',
      event_subtype: logoutMethod,
      timestamp: endTime.toISOString(),
      data: {
        logout_method: logoutMethod,
        logout_reason: logoutReason,
        session_duration: duration,
        total_page_views: activityCounts.pageViews || session.page_views,
        total_api_calls: activityCounts.apiCalls || session.api_calls,
        total_user_actions: activityCounts.userActions || session.user_actions,
        total_idle_time: activityCounts.idleTime || session.idle_time
      }
    };

    console.log('📝 API: Logging logout event:', logoutEventId);

    const { error: eventError } = await supabase
      .from('session_events')
      .insert([logoutEventData]);

    if (eventError) {
      console.error('⚠️ API: Error logging logout event:', eventError);
      // Don't fail the session end if event logging fails
    } else {
      console.log('✅ API: Logout event logged successfully');
    }

    console.log('🎉 API: Session ended successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Session ended successfully',
        sessionDuration: duration,
        endTime: endTime.toISOString()
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('💥 API: Unexpected error in session end:', error);
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