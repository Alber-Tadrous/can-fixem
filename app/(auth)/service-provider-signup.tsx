import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react-native';

interface ServiceProviderInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
}

const initialInfo: ServiceProviderInfo = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  phone: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
};

export default function ServiceProviderSignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();
  const [info, setInfo] = useState<ServiceProviderInfo>(initialInfo);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[a-zA-Z]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const zipRegex = /^\d{5}(-\d{4})?$/;

    if (!nameRegex.test(info.firstName)) {
      newErrors.firstName = 'First name must be 2-50 letters only';
    }
    if (!nameRegex.test(info.lastName)) {
      newErrors.lastName = 'Last name must be 2-50 letters only';
    }
    if (!emailRegex.test(info.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!passwordRegex.test(info.password)) {
      newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character';
    }
    if (info.password !== info.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!info.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!phoneRegex.test(info.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!info.street1.trim()) {
      newErrors.street1 = 'Street address is required';
    }
    if (!info.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!info.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!zipRegex.test(info.zip)) {
      newErrors.zip = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setErrors({}); // Clear previous errors
      await register({
        name: `${info.firstName} ${info.lastName}`,
        email: info.email,
        password: info.password,
        phone: info.phone,
        street1: info.street1,
        street2: info.street2,
        city: info.city,
        state: info.state,
        zip: info.zip,
        role: 'service-provider',
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.message || 'Registration failed. Please try again.',
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Service Provider Sign Up</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
              value={info.firstName}
              onChangeText={(text) => {
                setInfo({ ...info, firstName: text });
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
              value={info.lastName}
              onChangeText={(text) => {
                setInfo({ ...info, lastName: text });
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
            <Text style={[styles.label, { color: colors.text }]}>Business Name</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.businessName ? colors.danger : colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="Enter your business name"
              placeholderTextColor={colors.textSecondary}
              value={info.businessName}
              onChangeText={(text) => {
                setInfo({ ...info, businessName: text });
                if (errors.businessName) {
                  const { businessName, ...rest } = errors;
                  setErrors(rest);
                }
              }}
            />
            {errors.businessName && (
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.businessName}</Text>
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
              value={info.email}
              onChangeText={(text) => {
                setInfo({ ...info, email: text });
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
              value={info.phone}
              onChangeText={(text) => {
                setInfo({ ...info, phone: text });
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
              value={info.street1}
              onChangeText={(text) => {
                setInfo({ ...info, street1: text });
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
              value={info.street2}
              onChangeText={(text) => {
                setInfo({ ...info, street2: text });
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
                value={info.city}
                onChangeText={(text) => {
                  setInfo({ ...info, city: text });
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
                value={info.state}
                onChangeText={(text) => {
                  setInfo({ ...info, state: text });
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
                value={info.zip}
                onChangeText={(text) => {
                  setInfo({ ...info, zip: text });
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
              value={info.password}
              onChangeText={(text) => {
                setInfo({ ...info, password: text });
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
              value={info.confirmPassword}
              onChangeText={(text) => {
                setInfo({ ...info, confirmPassword: text });
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