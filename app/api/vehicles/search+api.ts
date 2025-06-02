import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const make = url.searchParams.get('make');
    const model = url.searchParams.get('model');
    const year = url.searchParams.get('year');
    const bodyType = url.searchParams.get('bodyType');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('vehicle_models')
      .select(`
        id,
        name,
        first_production_year,
        last_production_year,
        body_type,
        manufacturers (
          id,
          name
        ),
        model_trims (
          id,
          name,
          engine_type,
          transmission_type,
          drive_type
        )
      `)
      .range(offset, offset + limit - 1);

    if (make) {
      query = query.eq('manufacturers.name', make);
    }
    if (model) {
      query = query.ilike('name', `%${model}%`);
    }
    if (year) {
      query = query.and(`first_production_year.lte.${year},last_production_year.gte.${year}`);
    }
    if (bodyType) {
      query = query.eq('body_type', bodyType);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return Response.json({
      data,
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Error searching vehicles:', error);
    return new Response('Error searching vehicles', { status: 500 });
  }
}