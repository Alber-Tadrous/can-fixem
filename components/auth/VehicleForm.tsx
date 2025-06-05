// components/auth/VehicleForm.tsx
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Picker } from '@react-native-picker/picker';
import { useVehicles } from '@/hooks/useVehicles';
import { useEffect } from 'react';

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
  const { manufacturers, models, loading, error, loadModels } = useVehicles();

  useEffect(() => {
    if (vehicle.make) {
      const manufacturer = manufacturers.find(m => m.name === vehicle.make);
      if (manufacturer) {
        loadModels(manufacturer.id);
      }
    }
  }, [vehicle.make]);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => (currentYear - i).toString()
  );

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.danger }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>
          Error loading vehicle data. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Vehicle {index + 1}</Text>
        {showRemove && (
          <Trash2 
            size={20} 
            color={colors.danger} 
            onPress={() => onRemove(index)}
          />
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Make</Text>
          <View style={[styles.pickerContainer, { 
            backgroundColor: colors.inputBackground, 
            borderColor: errors?.[`${index}-make`] ? colors.danger : colors.border 
          }]}>
            {loading ? (
              <ActivityIndicator style={styles.loading} color={colors.primary} />
            ) : (
              <Picker
                selectedValue={vehicle.make}
                onValueChange={(value) => {
                  onUpdate(index, 'make', value);
                  onUpdate(index, 'model', '');
                }}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Select Make" value="" color={colors.textSecondary} />
                {manufacturers.map((make) => (
                  <Picker.Item key={make.id} label={make.name} value={make.name} color={colors.text} />
                ))}
              </Picker>
            )}
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
              enabled={!!vehicle.make}
            >
              <Picker.Item 
                label={vehicle.make ? "Select Model" : "Select Make First"} 
                value="" 
                color={colors.textSecondary} 
              />
              {models.map((model) => (
                <Picker.Item key={model.id} label={model.name} value={model.name} color={colors.text} />
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
            borderColor: errors?.[`${index}-year`] ? colors.danger : colors.border,
            opacity: !vehicle.model ? 0.5 : 1
          }]}>
            <Picker
              selectedValue={vehicle.year}
              onValueChange={(value) => onUpdate(index, 'year', value)}
              style={[styles.picker, { color: colors.text }]}
              enabled={!!vehicle.model}
            >
              <Picker.Item 
                label={vehicle.model ? "Select Year" : "Select Model First"} 
                value="" 
                color={colors.textSecondary} 
              />
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
  loading: {
    padding: 12,
  },
});
