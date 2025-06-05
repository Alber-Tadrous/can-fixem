import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
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
  location: string;
}

interface Vehicle {
  make: string;
  model: string;
  year: string;
}

const initialPersonalInfo: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  location: '',
};

const initialVehicle: Vehicle = {
  make: '',
  model: '',
  year: '',
};

export default function CarOwnerSignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialPersonalInfo);
  const [vehicles, setVehicles] = useState<Vehicle[]>([{ ...initialVehicle }]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePersonalInfo = () => {
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[a-zA-Z]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

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
    if (!personalInfo.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVehicles = () => {
    const newErrors: { [key: string]: string } = {};
    
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

  const handleSubmit = async () => {
    if (!validateVehicles()) return;

    try {
      await register({
        name: `${personalInfo.firstName} ${personalInfo.lastName}`,
        email: personalInfo.email,
        password: personalInfo.password,
        phone: personalInfo.phone,
        location: personalInfo.location,
        role: 'car-owner',
      });
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({
        submit: 'Registration failed. Please try again.',
      });
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
              <Text style={[styles.label, { color: colors.text }]}>Location</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.location ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Enter your location"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.location}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, location: text });
                  if (errors.location) {
                    const { location, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              />
              {errors.location && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.location}</Text>
              )}
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
            >
              <Plus size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Add Another Vehicle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Create Account</Text>
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
});