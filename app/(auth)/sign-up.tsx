import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, MapPin, Phone, ArrowLeft, Wrench, Car } from 'lucide-react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'car-owner' | 'service-provider' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      setError('');
      if (!selectedRole) {
        setError('Please select a role');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      await register({ ...formData, role: selectedRole });
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to create account');
    }
  };

  if (!selectedRole) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Your Role</Text>
        </View>

        <View style={styles.roleContainer}>
          <Text style={[styles.roleTitle, { color: colors.text }]}>How will you use Can Fixem?</Text>
          
          <TouchableOpacity
            style={[
              styles.roleCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => setSelectedRole('car-owner')}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: colors.primary + '10' }]}>
              <Car size={32} color={colors.primary} />
            </View>
            <Text style={[styles.roleCardTitle, { color: colors.text }]}>Car Owner</Text>
            <Text style={[styles.roleCardDescription, { color: colors.textSecondary }]}>
              Find reliable service providers and get your car fixed wherever you are
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => setSelectedRole('service-provider')}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: colors.secondary + '10' }]}>
              <Wrench size={32} color={colors.secondary} />
            </View>
            <Text style={[styles.roleCardTitle, { color: colors.text }]}>Service Provider</Text>
            <Text style={[styles.roleCardDescription, { color: colors.textSecondary }]}>
              Offer your services to car owners and grow your mobile business
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setSelectedRole(null)}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.roleIndicator, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {selectedRole === 'car-owner' ? (
            <Car size={20} color={colors.primary} />
          ) : (
            <Wrench size={20} color={colors.secondary} />
          )}
          <Text style={[styles.roleIndicatorText, { color: colors.text }]}>
            {selectedRole === 'car-owner' ? 'Car Owner' : 'Service Provider'}
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Join our community of {selectedRole === 'car-owner' ? 'car owners' : 'service providers'}
        </Text>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <User size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Mail size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Phone size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.textSecondary}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <MapPin size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Location"
              placeholderTextColor={colors.textSecondary}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Lock size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Lock size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />
          </View>

          {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: colors.primary }]}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.loginText, { color: colors.primary }]}> Sign In</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
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
  roleContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  roleTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  roleCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleCardTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  roleCardDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  roleIndicatorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  form: {
    gap: 16,
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  signUpButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  signUpButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  loginText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});