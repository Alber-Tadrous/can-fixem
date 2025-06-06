import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft, Wrench, Car } from 'lucide-react-native';

type UserRole = 'car-owner' | 'service-provider' | null;

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'car-owner') {
      router.push('/car-owner-signup');
    } else if (role === 'service-provider') {
      router.push('/service-provider-registration');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Join Can Fixem</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose how you'll use the platform
        </Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => handleRoleSelect('car-owner')}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: colors.primary + '10' }]}>
              <Car size={32} color={colors.primary} />
            </View>
            <Text style={[styles.roleTitle, { color: colors.text }]}>Car Owner</Text>
            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Find reliable service providers and get your car fixed wherever you are
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => handleRoleSelect('service-provider')}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: colors.secondary + '10' }]}>
              <Wrench size={32} color={colors.secondary} />
            </View>
            <Text style={[styles.roleTitle, { color: colors.text }]}>Service Provider</Text>
            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Offer your services to car owners and grow your mobile business
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg' }}
            style={styles.image}
          />
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
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  roleContainer: {
    gap: 16,
    marginBottom: 32,
  },
  roleCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 8,
  },
  roleDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: 16,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});