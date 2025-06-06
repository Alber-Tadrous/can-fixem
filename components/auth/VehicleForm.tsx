import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Manufacturer {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
}

interface VehicleFormProps {
  index: number;
  vehicle: {
    make: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
  };
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
  errors?: { [key: string]: string };
}

export default function VehicleForm({
  index,
  vehicle,
  onUpdate,
  onRemove,
  showRemove,
  errors,
}: VehicleFormProps) {
  const { colors } = useTheme();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const years = Array.from({ length: 125 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());

  useEffect(() => {
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (vehicle.make) {
      fetchModels(vehicle.make);
    } else {
      setModels([]);
      // Clear model selection when make changes
      if (vehicle.model) {
        onUpdate(index, 'model', '');
      }
    }
  }, [vehicle.make]);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('manufacturers')
        .select('id, name')
        .order('name');

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }
      
      setManufacturers(data || []);
    } catch (err: any) {
      console.error('Error fetching manufacturers:', err);
      setError('Failed to load manufacturers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (manufacturerId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('vehicle_models')
        .select('id, name')
        .eq('manufacturer_id', manufacturerId)
        .order('name');

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }
      
      setModels(data || []);
    } catch (err: any) {
      console.error('Error fetching models:', err);
      setError('Failed to load models. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (!vehicle.make) {
      fetchManufacturers();
    } else {
      fetchModels(vehicle.make);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Vehicle {index + 1}</Text>
        {showRemove && (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.danger + '20' }]}
            onPress={() => onRemove(index)}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Make</Text>
          <View style={[styles.pickerContainer, { 
            backgroundColor: colors.inputBackground, 
            borderColor: errors?.[`${index}-make`] ? colors.danger : colors.border,
            opacity: loading ? 0.5 : 1
          }]}>
            <Picker
              selectedValue={vehicle.make}
              onValueChange={(value) => onUpdate(index, 'make', value)}
              style={[styles.picker, { color: colors.text }]}
              enabled={!loading && manufacturers.length > 0}
            >
              <Picker.Item 
                label={loading ? "Loading..." : "Select Make"} 
                value="" 
                color={colors.textSecondary} 
              />
              {manufacturers.map((make) => (
                <Picker.Item key={make.id} label={make.name} value={make.id} color={colors.text} />
              ))}
            </Picker>
          </View>
          {errors?.[`${index}-make`] && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${index}-make`]}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Model</Text>
          <View style={[styles.pickerContainer, { 
            backgroundColor: colors.inputBackground,
            borderColor: errors?.[`${index}-model`] ? colors.danger : colors.border,
            opacity: (!vehicle.make || loading) ? 0.5 : 1
          }]}>
            <Picker
              selectedValue={vehicle.model}
              onValueChange={(value) => onUpdate(index, 'model', value)}
              style={[styles.picker, { color: colors.text }]}
              enabled={!!vehicle.make && !loading && models.length > 0}
            >
              <Picker.Item 
                label={
                  loading ? "Loading..." :
                  !vehicle.make ? "Select Make First" : 
                  models.length === 0 ? "No models available" :
                  "Select Model"
                } 
                value="" 
                color={colors.textSecondary} 
              />
              {models.map((model) => (
                <Picker.Item key={model.id} label={model.name} value={model.id} color={colors.text} />
              ))}
            </Picker>
          </View>
          {errors?.[`${index}-model`] && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${index}-model`]}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Year</Text>
          <View style={[styles.pickerContainer, { 
            backgroundColor: colors.inputBackground,
            borderColor: errors?.[`${index}-year`] ? colors.danger : colors.border 
          }]}>
            <Picker
              selectedValue={vehicle.year}
              onValueChange={(value) => onUpdate(index, 'year', value)}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Select Year" value="" color={colors.textSecondary} />
              {years.map((year) => (
                <Picker.Item key={year} label={year} value={year} color={colors.text} />
              ))}
            </Picker>
          </View>
          {errors?.[`${index}-year`] && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${index}-year`]}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Color</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.inputBackground,
                borderColor: errors?.[`${index}-color`] ? colors.danger : colors.border,
                color: colors.text,
              }
            ]}
            placeholder="e.g., Red, Blue, Silver"
            placeholderTextColor={colors.textSecondary}
            value={vehicle.color}
            onChangeText={(value) => onUpdate(index, 'color', value)}
          />
          {errors?.[`${index}-color`] && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${index}-color`]}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>License Plate</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.inputBackground,
                borderColor: errors?.[`${index}-licensePlate`] ? colors.danger : colors.border,
                color: colors.text,
              }
            ]}
            placeholder="e.g., ABC123"
            placeholderTextColor={colors.textSecondary}
            value={vehicle.licensePlate}
            onChangeText={(value) => onUpdate(index, 'licensePlate', value.toUpperCase())}
            autoCapitalize="characters"
            maxLength={8}
          />
          {errors?.[`${index}-licensePlate`] && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${index}-licensePlate`]}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    flex: 1,
  },
});