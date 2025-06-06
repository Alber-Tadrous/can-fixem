import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Upload, Check, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import ProgressSteps from '@/components/auth/ProgressSteps';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  profilePhoto: string | null;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
}

interface ServicePricing {
  offered: boolean;
  price: string;
  estimatedTime: string;
}

interface ServiceCategories {
  // Basic Maintenance & Checks
  engineOilCheck: ServicePricing;
  coolantCheck: ServicePricing;
  windshieldFluidCheck: ServicePricing;
  brakeFluidCheck: ServicePricing;
  powerSteeringCheck: ServicePricing;
  tirePressureCheck: ServicePricing;
  tireTreadCheck: ServicePricing;
  beltInspection: ServicePricing;
  hoseInspection: ServicePricing;
  
  // Component Replacements
  wiperBladeReplacement: ServicePricing;
  cabinAirFilter: ServicePricing;
  engineAirFilter: ServicePricing;
  lightBulbReplacement: ServicePricing;
  fuseReplacement: ServicePricing;
  oilChangeService: ServicePricing;
  tireRotation: ServicePricing;
  sparkPlugReplacement: ServicePricing;
  
  // Cleaning Services
  interiorDetailing: ServicePricing;
  exteriorWash: ServicePricing;
  exteriorWaxing: ServicePricing;
  
  // Battery Services
  batteryTerminalCleaning: ServicePricing;
  jumpStartService: ServicePricing;
  batteryReplacement: ServicePricing;
  cabinAirFilterBattery: ServicePricing;
  
  // Additional Services
  sideMirrorReplacement: ServicePricing;
  customService: ServicePricing & { description: string };
}

interface SparePartsInfo {
  canSupplyParts: boolean;
  markupPercentage: string;
  deliveryTime: string;
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

const initialPersonalInfo: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  profilePhoto: null,
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
};

const initialServicePricing: ServicePricing = {
  offered: false,
  price: '',
  estimatedTime: '',
};

const initialServices: ServiceCategories = {
  // Basic Maintenance & Checks
  engineOilCheck: { ...initialServicePricing },
  coolantCheck: { ...initialServicePricing },
  windshieldFluidCheck: { ...initialServicePricing },
  brakeFluidCheck: { ...initialServicePricing },
  powerSteeringCheck: { ...initialServicePricing },
  tirePressureCheck: { ...initialServicePricing },
  tireTreadCheck: { ...initialServicePricing },
  beltInspection: { ...initialServicePricing },
  hoseInspection: { ...initialServicePricing },
  
  // Component Replacements
  wiperBladeReplacement: { ...initialServicePricing },
  cabinAirFilter: { ...initialServicePricing },
  engineAirFilter: { ...initialServicePricing },
  lightBulbReplacement: { ...initialServicePricing },
  fuseReplacement: { ...initialServicePricing },
  oilChangeService: { ...initialServicePricing },
  tireRotation: { ...initialServicePricing },
  sparkPlugReplacement: { ...initialServicePricing },
  
  // Cleaning Services
  interiorDetailing: { ...initialServicePricing },
  exteriorWash: { ...initialServicePricing },
  exteriorWaxing: { ...initialServicePricing },
  
  // Battery Services
  batteryTerminalCleaning: { ...initialServicePricing },
  jumpStartService: { ...initialServicePricing },
  batteryReplacement: { ...initialServicePricing },
  cabinAirFilterBattery: { ...initialServicePricing },
  
  // Additional Services
  sideMirrorReplacement: { ...initialServicePricing },
  customService: { ...initialServicePricing, description: '' },
};

const initialSparePartsInfo: SparePartsInfo = {
  canSupplyParts: false,
  markupPercentage: '',
  deliveryTime: '',
};

export default function ServiceProviderRegistrationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialPersonalInfo);
  const [services, setServices] = useState<ServiceCategories>(initialServices);
  const [sparePartsInfo, setSparePartsInfo] = useState<SparePartsInfo>(initialSparePartsInfo);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    if (!personalInfo.profilePhoto) {
      newErrors.profilePhoto = 'Profile photo is required';
    }
    if (!personalInfo.street1.trim() || personalInfo.street1.length < 5 || personalInfo.street1.length > 100) {
      newErrors.street1 = 'Street address must be 5-100 characters';
    }
    if (personalInfo.street2 && (personalInfo.street2.length < 5 || personalInfo.street2.length > 100)) {
      newErrors.street2 = 'Street address line 2 must be 5-100 characters if provided';
    }
    if (!personalInfo.city.trim() || personalInfo.city.length < 2 || personalInfo.city.length > 50) {
      newErrors.city = 'City must be 2-50 characters';
    }
    if (!personalInfo.state) {
      newErrors.state = 'State is required';
    }
    if (!zipRegex.test(personalInfo.zip)) {
      newErrors.zip = 'Please enter a valid 5-digit ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateServices = () => {
    const newErrors: { [key: string]: string } = {};
    let hasOfferedService = false;

    Object.entries(services).forEach(([key, service]) => {
      if (service.offered) {
        hasOfferedService = true;
        
        const price = parseFloat(service.price);
        if (!service.price || isNaN(price) || price < 0) {
          newErrors[`${key}_price`] = 'Valid price is required';
        }
        
        const time = parseInt(service.estimatedTime);
        if (!service.estimatedTime || isNaN(time) || time <= 0) {
          newErrors[`${key}_time`] = 'Valid estimated time is required';
        }
        
        if (key === 'customService' && (!service.description || service.description.length < 10 || service.description.length > 200)) {
          newErrors[`${key}_description`] = 'Custom service description must be 10-200 characters';
        }
      }
    });

    if (!hasOfferedService) {
      newErrors.noServices = 'You must offer at least one service';
    }

    if (sparePartsInfo.canSupplyParts) {
      const markup = parseFloat(sparePartsInfo.markupPercentage);
      if (!sparePartsInfo.markupPercentage || isNaN(markup) || markup < 0 || markup > 100) {
        newErrors.markupPercentage = 'Markup percentage must be 0-100%';
      }
      
      const delivery = parseInt(sparePartsInfo.deliveryTime);
      if (!sparePartsInfo.deliveryTime || isNaN(delivery) || delivery <= 0) {
        newErrors.deliveryTime = 'Valid delivery time is required';
      }
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Check file size (5MB limit)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select an image smaller than 5MB.');
        return;
      }
      
      setPersonalInfo({ ...personalInfo, profilePhoto: asset.uri });
      if (errors.profilePhoto) {
        const { profilePhoto, ...rest } = errors;
        setErrors(rest);
      }
    }
  };

  const updateService = (serviceKey: keyof ServiceCategories, field: keyof ServicePricing | 'description', value: string | boolean) => {
    setServices(prev => ({
      ...prev,
      [serviceKey]: {
        ...prev[serviceKey],
        [field]: value,
      }
    }));
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
    if (!validateServices()) return;

    setIsSubmitting(true);
    try {
      setErrors({});
      
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
        role: 'service-provider',
      });

      // TODO: Save service offerings and spare parts info to database
      // This would typically involve creating service_provider record and service offerings

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

  const renderServiceItem = (
    serviceKey: keyof ServiceCategories,
    title: string,
    service: ServicePricing & { description?: string }
  ) => (
    <View key={serviceKey} style={[styles.serviceItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.serviceHeader}>
        <TouchableOpacity
          style={[styles.checkbox, service.offered && { backgroundColor: colors.primary }]}
          onPress={() => updateService(serviceKey, 'offered', !service.offered)}
        >
          {service.offered && <Check size={16} color="white" />}
        </TouchableOpacity>
        <Text style={[styles.serviceTitle, { color: colors.text }]}>{title}</Text>
      </View>
      
      {service.offered && (
        <View style={styles.serviceDetails}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceField}>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Price (USD)</Text>
              <TextInput
                style={[
                  styles.serviceInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors[`${serviceKey}_price`] ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={service.price}
                onChangeText={(value) => updateService(serviceKey, 'price', value)}
                keyboardType="decimal-pad"
              />
              {errors[`${serviceKey}_price`] && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${serviceKey}_price`]}</Text>
              )}
            </View>
            
            <View style={styles.serviceField}>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Time (min)</Text>
              <TextInput
                style={[
                  styles.serviceInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors[`${serviceKey}_time`] ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
                value={service.estimatedTime}
                onChangeText={(value) => updateService(serviceKey, 'estimatedTime', value)}
                keyboardType="numeric"
              />
              {errors[`${serviceKey}_time`] && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${serviceKey}_time`]}</Text>
              )}
            </View>
          </View>
          
          {serviceKey === 'customService' && (
            <View style={styles.serviceField}>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Service Description</Text>
              <TextInput
                style={[
                  styles.serviceTextArea,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors[`${serviceKey}_description`] ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Describe your custom service (10-200 characters)"
                placeholderTextColor={colors.textSecondary}
                value={service.description || ''}
                onChangeText={(value) => updateService(serviceKey, 'description', value)}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              {errors[`${serviceKey}_description`] && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors[`${serviceKey}_description`]}</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Service Provider Registration</Text>
      </View>

      <ProgressSteps currentStep={step} totalSteps={2} />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
            
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
                  value={personalInfo.firstName}
                  onChangeText={(text) => {
                    setPersonalInfo({ ...personalInfo, firstName: text });
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
                  value={personalInfo.lastName}
                  onChangeText={(text) => {
                    setPersonalInfo({ ...personalInfo, lastName: text });
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
              <Text style={[styles.label, { color: colors.text }]}>Profile Photo * (Max 5MB, JPG/PNG)</Text>
              <TouchableOpacity
                style={[
                  styles.photoUpload,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.profilePhoto ? colors.danger : colors.border,
                  }
                ]}
                onPress={pickImage}
              >
                {personalInfo.profilePhoto ? (
                  <Image source={{ uri: personalInfo.profilePhoto }} style={styles.profileImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Upload size={32} color={colors.textSecondary} />
                    <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                      Tap to upload photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.profilePhoto && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.profilePhoto}</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
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

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Complete Address *</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Street Address Line 1 * (5-100 characters)</Text>
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
                maxLength={100}
              />
              {errors.street1 && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.street1}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Street Address Line 2 (5-100 characters)</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.street2 ? colors.danger : colors.border,
                    color: colors.text,
                  }
                ]}
                placeholder="Apartment, suite, etc. (optional)"
                placeholderTextColor={colors.textSecondary}
                value={personalInfo.street2}
                onChangeText={(text) => {
                  setPersonalInfo({ ...personalInfo, street2: text });
                  if (errors.street2) {
                    const { street2, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                maxLength={100}
              />
              {errors.street2 && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.street2}</Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={[styles.label, { color: colors.text }]}>City * (2-50 characters)</Text>
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
                  maxLength={50}
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
                    selectedValue={personalInfo.state}
                    onValueChange={(value) => {
                      setPersonalInfo({ ...personalInfo, state: value });
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
              <Text style={[styles.label, { color: colors.text }]}>ZIP Code * (5-digit format)</Text>
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
              <Text style={styles.buttonText}>Next: Service Categories</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Categories and Pricing</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Select the services you offer and set your pricing. All prices are in USD.
            </Text>

            {errors.noServices && (
              <Text style={[styles.errorText, { color: colors.danger, textAlign: 'center', marginBottom: 16 }]}>
                {errors.noServices}
              </Text>
            )}

            <Text style={[styles.categoryTitle, { color: colors.text }]}>1. Basic Maintenance & Checks</Text>
            {renderServiceItem('engineOilCheck', 'Engine Oil Level Check', services.engineOilCheck)}
            {renderServiceItem('coolantCheck', 'Coolant Level Check', services.coolantCheck)}
            {renderServiceItem('windshieldFluidCheck', 'Windshield Washer Fluid Check', services.windshieldFluidCheck)}
            {renderServiceItem('brakeFluidCheck', 'Brake Fluid Check', services.brakeFluidCheck)}
            {renderServiceItem('powerSteeringCheck', 'Power Steering Fluid Check', services.powerSteeringCheck)}
            {renderServiceItem('tirePressureCheck', 'Tire Pressure Check', services.tirePressureCheck)}
            {renderServiceItem('tireTreadCheck', 'Tire Tread Depth Measurement', services.tireTreadCheck)}
            {renderServiceItem('beltInspection', 'Belt Inspection (Serpentine/Timing/V-Belt)', services.beltInspection)}
            {renderServiceItem('hoseInspection', 'Hose Inspection (All Systems)', services.hoseInspection)}

            <Text style={[styles.categoryTitle, { color: colors.text }]}>2. Component Replacements</Text>
            {renderServiceItem('wiperBladeReplacement', 'Windshield Wiper Blade Replacement', services.wiperBladeReplacement)}
            {renderServiceItem('cabinAirFilter', 'Cabin Air Filter Replacement', services.cabinAirFilter)}
            {renderServiceItem('engineAirFilter', 'Engine Air Filter Replacement', services.engineAirFilter)}
            {renderServiceItem('lightBulbReplacement', 'Light Bulb Replacement', services.lightBulbReplacement)}
            {renderServiceItem('fuseReplacement', 'Fuse Replacement', services.fuseReplacement)}
            {renderServiceItem('oilChangeService', 'Oil Change Service', services.oilChangeService)}
            {renderServiceItem('tireRotation', 'Tire Rotation', services.tireRotation)}
            {renderServiceItem('sparkPlugReplacement', 'Spark Plug Replacement', services.sparkPlugReplacement)}

            <Text style={[styles.categoryTitle, { color: colors.text }]}>3. Cleaning Services</Text>
            {renderServiceItem('interiorDetailing', 'Interior Detailing', services.interiorDetailing)}
            {renderServiceItem('exteriorWash', 'Exterior Wash', services.exteriorWash)}
            {renderServiceItem('exteriorWaxing', 'Exterior Waxing', services.exteriorWaxing)}

            <Text style={[styles.categoryTitle, { color: colors.text }]}>4. Battery Services</Text>
            {renderServiceItem('batteryTerminalCleaning', 'Battery Terminal Cleaning', services.batteryTerminalCleaning)}
            {renderServiceItem('jumpStartService', 'Jump-Start Service', services.jumpStartService)}
            {renderServiceItem('batteryReplacement', 'Battery Replacement', services.batteryReplacement)}
            {renderServiceItem('cabinAirFilterBattery', 'Cabin Air Filter Replacement', services.cabinAirFilterBattery)}

            <Text style={[styles.categoryTitle, { color: colors.text }]}>5. Additional Services</Text>
            {renderServiceItem('sideMirrorReplacement', 'Side Mirror Replacement', services.sideMirrorReplacement)}
            {renderServiceItem('customService', 'Custom Service', services.customService)}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Spare Parts Options</Text>
            
            <View style={[styles.radioGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.radioLabel, { color: colors.text }]}>
                Can you supply spare parts for selected services?
              </Text>
              
              <View style={styles.radioOptions}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setSparePartsInfo({ ...sparePartsInfo, canSupplyParts: true })}
                >
                  <View style={[styles.radioButton, sparePartsInfo.canSupplyParts && { backgroundColor: colors.primary }]}>
                    {sparePartsInfo.canSupplyParts && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.radioText, { color: colors.text }]}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setSparePartsInfo({ ...sparePartsInfo, canSupplyParts: false, markupPercentage: '', deliveryTime: '' })}
                >
                  <View style={[styles.radioButton, !sparePartsInfo.canSupplyParts && { backgroundColor: colors.primary }]}>
                    {!sparePartsInfo.canSupplyParts && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.radioText, { color: colors.text }]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {sparePartsInfo.canSupplyParts && (
              <View style={styles.sparePartsDetails}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Parts Markup Percentage (0-100%)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: colors.inputBackground,
                        borderColor: errors.markupPercentage ? colors.danger : colors.border,
                        color: colors.text,
                      }
                    ]}
                    placeholder="15"
                    placeholderTextColor={colors.textSecondary}
                    value={sparePartsInfo.markupPercentage}
                    onChangeText={(text) => {
                      setSparePartsInfo({ ...sparePartsInfo, markupPercentage: text });
                      if (errors.markupPercentage) {
                        const { markupPercentage, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    keyboardType="numeric"
                  />
                  {errors.markupPercentage && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{errors.markupPercentage}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Estimated Parts Delivery Time (in days)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: colors.inputBackground,
                        borderColor: errors.deliveryTime ? colors.danger : colors.border,
                        color: colors.text,
                      }
                    ]}
                    placeholder="2"
                    placeholderTextColor={colors.textSecondary}
                    value={sparePartsInfo.deliveryTime}
                    onChangeText={(text) => {
                      setSparePartsInfo({ ...sparePartsInfo, deliveryTime: text });
                      if (errors.deliveryTime) {
                        const { deliveryTime, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    keyboardType="numeric"
                  />
                  {errors.deliveryTime && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{errors.deliveryTime}</Text>
                  )}
                </View>
              </View>
            )}

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[styles.checkbox, acceptedTerms && { backgroundColor: colors.primary }]}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                {acceptedTerms && <Check size={16} color="white" />}
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: colors.text }]}>
                I accept the terms of service and privacy policy *
              </Text>
            </View>
            {errors.terms && (
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.terms}</Text>
            )}

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
  sectionSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  categoryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 12,
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
  serviceItem: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    flex: 1,
  },
  serviceDetails: {
    marginTop: 16,
    gap: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceField: {
    flex: 1,
    gap: 4,
  },
  serviceLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  serviceInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  serviceTextArea: {
    height: 80,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  radioGroup: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  radioLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  radioOptions: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  radioText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  sparePartsDetails: {
    gap: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    flex: 1,
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
});