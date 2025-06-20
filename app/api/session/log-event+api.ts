import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('📝 API: Log event endpoint called');
    
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

    console.log('✅ API: User authenticated for event logging:', user.id);

    // Parse request body
    const body = await request.json();
    const { 
      sessionId,
      eventType,
      eventSubtype,
      data = {},
      userAgent,
      deviceInfo = {}
    } = body;

    if (!sessionId || !eventType) {
      console.log('❌ API: Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing sessionId or eventType' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📝 API: Logging event:', eventType, eventSubtype, 'for session:', sessionId);

    // Verify session exists and belongs to user
    const { data: sessionExists, error: sessionCheckError } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionCheckError || !sessionExists) {
      console.error('❌ API: Session does not exist or does not belong to user:', sessionCheckError);
      return new Response(
        JSON.stringify({ error: 'Invalid session' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create event record
    const eventData = {
      id: eventId,
      session_id: sessionId,
      user_id: user.id,
      event_type: eventType,
      event_subtype: eventSubtype || null,
      timestamp: new Date().toISOString(),
      data: data,
      ip_address: null, // Could be extracted from headers in production
      user_agent: userAgent || null,
      device_info: deviceInfo
    };

    console.log('💾 API: Inserting event data:', { ...eventData, data: 'object' });

    const { error: eventError } = await supabase
      .from('session_events')
      .insert([eventData]);

    if (eventError) {
      console.error('❌ API: Error creating event:', eventError);
      return new Response(
        JSON.stringify({ error: 'Failed to log event', details: eventError.message }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update session activity counts
    const updateField = eventType === 'page_view' ? 'page_views' : 
                       eventType === 'api_call' ? 'api_calls' : 
                       eventType === 'user_action' ? 'user_actions' : null;

    if (updateField) {
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ 
          [updateField]: supabase.sql`${updateField} + 1`,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('⚠️ API: Error updating session counts:', updateError);
        // Don't fail the event logging if count update fails
      }
    }

    console.log('✅ API: Event logged successfully:', eventId);

    return new Response(
      JSON.stringify({ 
        success: true,
        eventId,
        message: 'Event logged successfully'
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('💥 API: Unexpected error in log event:', error);
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