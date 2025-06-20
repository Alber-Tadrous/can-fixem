export async function POST(request: Request) {
  try {
    console.log('🔚 API: Logout endpoint called');
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    const sessionId = request.headers.get('X-Session-ID');
    
    console.log('🔚 API: Auth header present:', !!authHeader);
    console.log('🔚 API: Session ID:', sessionId);
    
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
    
    // Import supabase with service role for admin operations
    const { createClient } = await import('@supabase/supabase-js');
    
    // Create admin client for session management
    const supabaseAdmin = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
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
    
    console.log('✅ API: User verified:', user.email);
    
    // End the session in our tracking system if session ID provided
    if (sessionId) {
      try {
        console.log('📊 API: Ending session tracking for:', sessionId);
        
        const { error: sessionError } = await supabaseAdmin
          .from('user_sessions')
          .update({
            end_time: new Date().toISOString(),
            logout_method: 'manual',
            logout_reason: 'User initiated logout via API',
            status: 'terminated',
            cleanup_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .eq('user_id', user.id);
        
        if (sessionError) {
          console.error('❌ API: Error updating session:', sessionError);
        } else {
          console.log('✅ API: Session tracking ended successfully');
        }
        
        // Log logout event
        await supabaseAdmin
          .from('session_events')
          .insert([{
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            session_id: sessionId,
            user_id: user.id,
            event_type: 'logout',
            event_subtype: 'api_logout',
            timestamp: new Date().toISOString(),
            data: {
              logout_method: 'api',
              user_agent: request.headers.get('User-Agent'),
              ip_address: request.headers.get('X-Forwarded-For') || 'unknown'
            }
          }]);
          
        console.log('✅ API: Logout event logged');
        
      } catch (sessionTrackingError) {
        console.error('❌ API: Session tracking error (non-fatal):', sessionTrackingError);
        // Don't fail the logout if session tracking fails
      }
    }
    
    // Sign out the user from Supabase (this invalidates the token)
    const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(token, 'global');
    
    if (signOutError) {
      console.error('❌ API: Supabase signOut error:', signOutError);
      // Even if signOut fails, we'll return success since we've cleaned up our tracking
    } else {
      console.log('✅ API: Supabase admin signOut successful');
    }
    
    console.log('🎉 API: Logout completed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
    
  } catch (error) {
    console.error('❌ API: Unexpected logout error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during logout',
        message: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-ID',
      'Access-Control-Max-Age': '86400',
    },
  });
}