import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus } from 'lucide-react-native';
import ProgressSteps from '@/components/auth/ProgressSteps';
import VehicleForm from '@/components/auth/VehicleForm';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
}

interface Vehicle {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
}

const initialPersonalInfo: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
};

const initialVehicle: Vehicle = {
  make: '',
  model: '',
  year: '',
  color: '',
  licensePlate: '',
};

export default function CarOwnerSignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialPersonalInfo);
  const [vehicles, setVehicles] = useState<Vehicle[]>([{ ...initialVehicle }]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePersonalInfo = () => {
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[a-zA-Z]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const zipRegex = /^\d{5}(-\d{4})?$/;

    if (!nameRegex.test(personalInfo.firstName)) {
      newErrors.firstName = 'First name must be 2-50 letters only';
    }
    if (!nameRegex.test(personalInfo.lastName)) {
      newErrors.lastName = 'Last name must be 2-50 letters only';
    }
    if (!emailRegex.test(personalInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!passwordRegex.test(personalInfo.password)) {
      newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character';
    }
    if (personalInfo.password !== personalInfo.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!phoneRegex.test(personalInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!personalInfo.street1.trim()) {
      newErrors.street1 = 'Street address is required';
    }
    if (!personalInfo.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!personalInfo.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!zipRegex.test(personalInfo.zip)) {
      newErrors.zip = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVehicles = () => {
    const newErrors: { [key: string]: string } = {};
    const licensePlateRegex = /^[A-Z0-9-]{2,8}$/i;
    
    vehicles.forEach((vehicle, index) => {
      if (!vehicle.make) {
        newErrors[`${index}-make`] = 'Make is required';
      }
      if (!vehicle.model) {
        newErrors[`${index}-model`] = 'Model is required';
      }
      if (!vehicle.year) {
        newErrors[`${index}-year`] = 'Year is required';
      }
      if (!vehicle.color.trim()) {
        newErrors[`${index}-color`] = 'Color is required';
      }
      if (!vehicle.licensePlate.trim()) {
        newErrors[`${index}-licensePlate`] = 'License plate is required';
      } else if (!licensePlateRegex.test(vehicle.licensePlate)) {
        newErrors[`${index}-licensePlate`] = 'Please enter a valid license plate';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validatePersonalInfo()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  const saveVehiclesToDatabase = async (userId: string) => {
    try {
      // Get manufacturer and model names for the vehicles
      const vehicleData = await Promise.all(
        vehicles.map(async (vehicle) => {
          // Get manufacturer name
          const { data: manufacturer } = await supabase
            .from('manufacturers')
            .select('name')
            .eq('id', vehicle.make)
            .single();

          // Get model name
          const { data: model } = await supabase
            .from('vehicle_models')
            .select('name')
            .eq('id', vehicle.model)
            .single();

          return {
            owner_id: userId,
            make: manufacturer?.name || vehicle.make,
            model: model?.name || vehicle.model,
            year: parseInt(vehicle.year),
            color: vehicle.color,
            license_plate: vehicle.licensePlate.toUpperCase(),
          };
        })
      );

      // Insert all vehicles
      const { error: vehicleError } = await supabase
        .from('cars')
        .insert(vehicleData);

      if (vehicleError) {
        console.error('Error saving vehicles:', vehicleError);
        throw new Error('Failed to save vehicle information');
      }

      console.log('Vehicles saved successfully:', vehicleData);
    } catch (error) {
      console.error('Error in saveVehiclesToDatabase:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateVehicles()) return;

    setIsSubmitting(true);
    try {
      setErrors({}); // Clear previous errors
      
      // First, register the user
      await register({
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        email: personalInfo.email,
        password: personalInfo.password,
        phone: personalInfo.phone,
        street1: personalInfo.street1,
        street2: personalInfo.street2,
        city: personalInfo.city,
        state: personalInfo.state,
        zip: personalInfo.zip,
        role: 'car-owner',
      });

      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User registration failed');
      }

      // Save vehicles to database
      await saveVehiclesToDatabase(user.id);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVehicle = () => {
    setVehicles([...vehicles, { ...initialVehicle }]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index));
    }
  };

  const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    setVehicles(updatedVehicles);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
      </View>

      <ProgressSteps currentStep={step} totalSteps={2} />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.firstName ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.firstName}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, firstName: text });
                  if (errors.firstName) {
                    const { firstName, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              />
              {errors.firstName && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.lastName ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.lastName}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, lastName: text });
                  if (errors.lastName) {
                    const { lastName, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              />
              {errors.lastName && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.lastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.email ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your email address"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.email}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, email: text });
                  if (errors.email) {
                    const { email, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.phone ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.phone}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, phone: text });
                  if (errors.phone) {
                    const { phone, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                keyboardType="phone-pad"
              />
              {errors.phone && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Street Address</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.street1 ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your street address"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.street1}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, street1: text });
                  if (errors.street1) {
                    const { street1, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              />
              {errors.street1 && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.street1}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Apartment, Suite, etc. (optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter apartment or suite number"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.street2}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, street2: text });
                }}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text }]}>City</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.city ? colors.danger : colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                  value={personalInfo.city}
                  onChangeText={(text) => {
                    setPersonalInfo({ ...personalInfo, city: text });
                    if (errors.city) {
                      const { city, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                />
                {errors.city && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.city}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={[styles.label, { color: colors.text }]}>State</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.state ? colors.danger : colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="State"
                  placeholderTextColor={colors.textSecondary}
                  value={personalInfo.state}
                  onChangeText={(text) => {
                    setPersonalInfo({ ...personalInfo, state: text });
                    if (errors.state) {
                      const { state, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                />
                {errors.state && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.state}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={[styles.label, { color: colors.text }]}>ZIP Code</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.zip ? colors.danger : colors.border,
                      color: colors.text,
                    }
                  ]}
                  placeholder="ZIP"
                  placeholderTextColor={colors.textSecondary}
                  value={personalInfo.zip}
                  onChangeText={(text) => {
                    setPersonalInfo({ ...personalInfo, zip: text });
                    if (errors.zip) {
                      const { zip, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {errors.zip && (
                  <Text style={[styles.errorText, { color: colors.danger }]}>{errors.zip}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.password ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Create a password"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.password}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, password: text });
                  if (errors.password) {
                    const { password, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                secureTextEntry
              />
              {errors.password && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.confirmPassword ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.confirmPassword}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, confirmPassword: text });
                  if (errors.confirmPassword) {
                    const { confirmPassword, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {vehicles.map((vehicle, index) => (
              <VehicleForm
                key={index}
                index={index}
                vehicle={vehicle}
                onUpdate={updateVehicle}
                onRemove={removeVehicle}
                showRemove={vehicles.length > 1}
                errors={errors}
              />
            ))}

            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.primary }]}
              onPress={addVehicle}
              disabled={isSubmitting}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Add Another Vehicle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                { 
                  backgroundColor: isSubmitting ? colors.textSecondary : colors.primary,
                  opacity: isSubmitting ? 0.7 : 1
                }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {errors.submit && (
              <Text style={[styles.errorText, { color: colors.danger, textAlign: 'center', marginTop: 16 }]}>
                {errors.submit}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
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
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 8,
  },
});