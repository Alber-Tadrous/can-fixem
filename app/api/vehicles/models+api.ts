import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const manufacturerId = url.searchParams.get('manufacturerId');

    if (!manufacturerId) {
      return new Response('Manufacturer ID is required', { status: 400 });
    }

    const { data, error } = await supabase
      .from('vehicle_models')
      .select('id, name')
      .eq('manufacturer_id', manufacturerId)
      .order('name');

    if (error) {
      throw error;
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return new Response('Error fetching models', { status: 500 });
  }
}