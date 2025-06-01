import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Plus, Car, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';

interface VehicleForm {
  make: string;
  model: string;
  year: string;
  mileage: string;
}

const initialVehicleForm: VehicleForm = {
  make: '',
  model: '',
  year: '',
  mileage: '',
};

export default function VehiclesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleForm[]>([{ ...initialVehicleForm }]);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const handleInputChange = (index: number, field: keyof VehicleForm, value: string) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = {
      ...updatedVehicles[index],
      [field]: value,
    };
    setVehicles(updatedVehicles);
    
    // Clear error for this field if it exists
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const addVehicle = () => {
    setVehicles([...vehicles, { ...initialVehicleForm }]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      const updatedVehicles = vehicles.filter((_, i) => i !== index);
      setVehicles(updatedVehicles);
      
      // Remove any errors for this vehicle
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${index}-`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string[] } = {};
    
    vehicles.forEach((vehicle, index) => {
      if (!vehicle.make.trim()) {
        newErrors[`${index}-make`] = ['Make is required'];
      }
      if (!vehicle.model.trim()) {
        newErrors[`${index}-model`] = ['Model is required'];
      }
      if (!vehicle.year.trim()) {
        newErrors[`${index}-year`] = ['Year is required'];
      } else if (!/^\d{4}$/.test(vehicle.year)) {
        newErrors[`${index}-year`] = ['Please enter a valid 4-digit year'];
      }
      if (!vehicle.mileage.trim()) {
        newErrors[`${index}-mileage`] = ['Mileage is required'];
      } else if (!/^\d+$/.test(vehicle.mileage)) {
        newErrors[`${index}-mileage`] = ['Please enter a valid mileage number'];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Here you would typically save the vehicles to your backend
      console.log('Vehicles to save:', vehicles);
      router.back();
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader 
        title="My Vehicles" 
        showBackButton
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {vehicles.map((vehicle, index) => (
          <View 
            key={index}
            style={[styles.vehicleForm, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.formHeader}>
              <View style={styles.formTitle}>
                <Car size={20} color={colors.primary} />
                <Text style={[styles.formTitleText, { color: colors.text }]}>
                  Vehicle {index + 1}
                </Text>
              </View>
              
              {vehicles.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeVehicle(index)}
                  style={[styles.removeButton, { backgroundColor: colors.danger + '20' }]}
                >
                  <X size={20} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Make</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors[`${index}-make`] ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="e.g., Toyota"
                placeholderTextColor={colors.textSecondary}
                value={vehicle.make}
                onChangeText={(value) => handleInputChange(index, 'make', value)}
              />
              {errors[`${index}-make`]?.map((error, i) => (
                <Text key={i} style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Model</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors[`${index}-model`] ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="e.g., Camry"
                placeholderTextColor={colors.textSecondary}
                value={vehicle.model}
                onChangeText={(value) => handleInputChange(index, 'model', value)}
              />
              {errors[`${index}-model`]?.map((error, i) => (
                <Text key={i} style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              ))}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.text }]}>Year</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      borderColor: errors[`${index}-year`] ? colors.danger : colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="e.g., 2020"
                  placeholderTextColor={colors.textSecondary}
                  value={vehicle.year}
                  onChangeText={(value) => handleInputChange(index, 'year', value)}
                  keyboardType="numeric"
                  maxLength={4}
                />
                {errors[`${index}-year`]?.map((error, i) => (
                  <Text key={i} style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                ))}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.text }]}>Mileage</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      borderColor: errors[`${index}-mileage`] ? colors.danger : colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="e.g., 50000"
                  placeholderTextColor={colors.textSecondary}
                  value={vehicle.mileage}
                  onChangeText={(value) => handleInputChange(index, 'mileage', value)}
                  keyboardType="numeric"
                />
                {errors[`${index}-mileage`]?.map((error, i) => (
                  <Text key={i} style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                ))}
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, { borderColor: colors.primary }]}
          onPress={addVehicle}
        >
          <Plus size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>
            Add Another Vehicle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Save Vehicles</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  vehicleForm: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formTitleText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});