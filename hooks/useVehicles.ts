// hooks/useVehicles.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Manufacturer {
  id: string;
  name: string;
}

interface VehicleModel {
  id: string;
  name: string;
  first_production_year: number;
  last_production_year: number | null;
}

export function useVehicles() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get cached manufacturers first
      const cached = await AsyncStorage.getItem('manufacturers');
      if (cached) {
        const parsedData = JSON.parse(cached);
        setManufacturers(parsedData);
        setLoading(false);
      }

      // Fetch fresh data
      const response = await fetch('/api/vehicles/manufacturers');
      if (!response.ok) {
        throw new Error('Failed to fetch manufacturers');
      }

      const data = await response.json();
      setManufacturers(data);
      await AsyncStorage.setItem('manufacturers', JSON.stringify(data));
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (manufacturerId: string) => {
    try {
      setLoading(true);
      setError(null);
      setModels([]); // Clear previous models

      const response = await fetch(`/api/vehicles/models?manufacturerId=${manufacturerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      setModels(data);
    } catch (err) {
      console.error('Error loading models:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    manufacturers,
    models,
    loading,
    error,
    loadModels,
    refreshManufacturers: loadManufacturers,
  };
}