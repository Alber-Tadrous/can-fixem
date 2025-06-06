import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  base_price: number;
  created_at?: string;
  updated_at?: string;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching services:', fetchError);
        throw fetchError;
      }

      setServices(data || []);
    } catch (err: any) {
      console.error('Error in fetchServices:', err);
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const refetch = () => {
    fetchServices();
  };

  const getServicesByCategory = (category: string) => {
    if (category === 'all') return services;
    return services.filter(service => service.category === category);
  };

  return {
    services,
    loading,
    error,
    refetch,
    getServicesByCategory,
  };
}