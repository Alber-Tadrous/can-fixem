import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('id, name')
      .order('name');

    if (error) {
      throw error;
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return new Response('Error fetching manufacturers', { status: 500 });
  }
}