import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';

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
  const years = Array.from({ length: 125 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (vehicle.make) {
      fetchModels(vehicle.make);
    }
  }, [vehicle.make]);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/vehicles/makes');
      if (!response.ok) throw new Error('Failed to fetch manufacturers');
      const data = await response.json();
      setManufacturers(data);
    } catch (err) {
      setError('Error loading manufacturers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (manufacturerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/vehicles/models?manufacturerId=${manufacturerId}`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data);
    } catch (err) {
      setError('Error loading models');
      console.error(err);
    } finally {
      setLoading(false);
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
        <Text style={[styles.errorText, { color: colors.danger, marginBottom: 16 }]}>{error}</Text>
      )}

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Make</Text>
          <View style={[styles.pickerContainer, { 
            backgroundColor: colors.inputBackground, 
            borderColor: errors?.[`${index}-make`] ? colors.danger : colors.border 
          }]}>
            <Picker
              selectedValue={vehicle.make}
              onValueChange={(value) => onUpdate(index, 'make', value)}
              style={[styles.picker, { color: colors.text }]}
              enabled={!loading}
            >
              <Picker.Item label="Select Make" value="" color={colors.textSecondary} />
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
            opacity: !vehicle.make ? 0.5 : 1
          }]}>
            <Picker
              selectedValue={vehicle.model}
              onValueChange={(value) => onUpdate(index, 'model', value)}
              style={[styles.picker, { color: colors.text }]}
              enabled={!!vehicle.make && !loading}
            >
              <Picker.Item 
                label={vehicle.make ? "Select Model" : "Select Make First"} 
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
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});