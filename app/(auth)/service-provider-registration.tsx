import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Upload, Check } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

interface ServiceProviderInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePhoto: string | null;
  businessName: string;
  businessDescription: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  serviceRadius: string;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const initialInfo: ServiceProviderInfo = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  profilePhoto: null,
  businessName: '',
  businessDescription: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  serviceRadius: '25',
};

export default function ServiceProviderRegistrationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();
  const [info, setInfo] = useState<ServiceProviderInfo>(initialInfo);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{6,}$/;
    const zipRegex = /^\d{5}(-\d{4})?$/;

    if (!nameRegex.test(info.firstName)) {
      newErrors.firstName = 'First name must be 2-50 characters, letters only';
    }
    if (!nameRegex.test(info.lastName)) {
      newErrors.lastName = 'Last name must be 2-50 characters, letters only';
    }
    if (!emailRegex.test(info.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!passwordRegex.test(info.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (info.password !== info.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!info.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!info.businessDescription.trim()) {
      newErrors.businessDescription = 'Business description is required';
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
    if (!info.serviceRadius || parseInt(info.serviceRadius) < 1 || parseInt(info.serviceRadius) > 100) {
      newErrors.serviceRadius = 'Service radius must be between 1 and 100 miles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Alert.alert('File too large', 'Please select an image smaller than 2MB.');
          return;
        }
        
        setInfo({ ...info, profilePhoto: asset.uri });
        if (errors.profilePhoto) {
          const { profilePhoto, ...rest } = errors;
          setErrors(rest);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      setErrors({});
      
      console.log('Attempting service provider registration...');
      
      const registrationData = {
        name: `${info.firstName} ${info.lastName}`,
        email: info.email,
        password: info.password,
        role: 'service-provider' as const,
        avatar: info.profilePhoto,
        businessName: info.businessName,
        description: info.businessDescription,
        services: [], // Empty array - services will be managed from profile
        serviceRadius: parseInt(info.serviceRadius),
        street1: info.street1,
        street2: info.street2,
        city: info.city,
        state: info.state,
        zip: info.zip,
      };

      console.log('Registration data:', registrationData);

      await register(registrationData);

      console.log('Registration successful, navigating to main app');
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.message.includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message.includes('email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Service Provider Registration</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Profile Photo (Optional)</Text>
            <TouchableOpacity
              style={[
                styles.photoUpload,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                }
              ]}
              onPress={pickImage}
            >
              {info.profilePhoto ? (
                <Image source={{ uri: info.profilePhoto }} style={styles.profileImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Upload size={32} color={colors.textSecondary} />
                  <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                    Tap to upload photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
            <View style={styles.nameRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.nameInput,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.firstName ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="First Name"
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
              <TextInput
                style={[
                  styles.input,
                  styles.nameInput,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.lastName ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Last Name"
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
            </View>
            {(errors.firstName || errors.lastName) && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errors.firstName || errors.lastName}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
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

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Information</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Business Name *</Text>
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
            <Text style={[styles.label, { color: colors.text }]}>Business Description *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.businessDescription ? colors.danger : colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="Describe your automotive services and expertise"
              placeholderTextColor={colors.textSecondary}
              value={info.businessDescription}
              onChangeText={(text) => {
                setInfo({ ...info, businessDescription: text });
                if (errors.businessDescription) {
                  const { businessDescription, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.businessDescription && (
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.businessDescription}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Service Radius (miles) *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.serviceRadius ? colors.danger : colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="How far will you travel? (e.g., 25)"
              placeholderTextColor={colors.textSecondary}
              value={info.serviceRadius}
              onChangeText={(text) => {
                setInfo({ ...info, serviceRadius: text });
                if (errors.serviceRadius) {
                  const { serviceRadius, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              keyboardType="numeric"
            />
            {errors.serviceRadius && (
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.serviceRadius}</Text>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Address *</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Street Address *</Text>
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
            <Text style={[styles.label, { color: colors.text }]}>Apartment, Suite, etc. (Optional)</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>City *</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>State *</Text>
              <View style={[styles.pickerContainer, { 
                backgroundColor: colors.inputBackground,
                borderColor: errors.state ? colors.danger : colors.border 
              }]}>
                <Picker
                  selectedValue={info.state}
                  onValueChange={(value) => {
                    setInfo({ ...info, state: value });
                    if (errors.state) {
                      const { state, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="Select State" value="" color={colors.textSecondary} />
                  {US_STATES.map((state) => (
                    <Picker.Item key={state} label={state} value={state} color={colors.text} />
                  ))}
                </Picker>
              </View>
              {errors.state && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.state}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>ZIP Code *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.zip ? colors.danger : colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="12345"
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

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.password ? colors.danger : colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="Create a password (minimum 6 characters)"
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
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password *</Text>
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
              {isSubmitting ? 'Creating Account...' : 'Create Service Provider Account'}
            </Text>
          </TouchableOpacity>

          {errors.submit && (
            <View style={[styles.submitErrorContainer, { backgroundColor: colors.danger + '10', borderColor: colors.danger }]}>
              <Text style={[styles.submitErrorText, { color: colors.danger }]}>
                {errors.submit}
              </Text>
            </View>
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
    fontSize: 20,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginTop: 8,
    marginBottom: 8,
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
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  photoUpload: {
    height: 120,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 0,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  submitErrorContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  submitErrorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});