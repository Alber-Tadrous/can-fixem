import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Settings, Car, Star, CreditCard, Bell, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import ProfileMenuOption from '@/components/profile/ProfileMenuOption';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'John Doe'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'john.doe@example.com'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.editButton, { borderColor: colors.border }]}
            onPress={() => router.push('/edit-profile')}
          >
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        <ProfileMenuOption
          icon={<Car size={20} color={colors.primary} />}
          title="My Vehicles"
          onPress={() => router.push('/vehicles')}
        />
        
        <ProfileMenuOption
          icon={<Star size={20} color={colors.primary} />}
          title="Saved Providers"
          onPress={() => router.push('/saved-providers')}
        />
        
        <ProfileMenuOption
          icon={<CreditCard size={20} color={colors.primary} />}
          title="Payment Methods"
          onPress={() => router.push('/payment-methods')}
        />
      </View>
      
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        
        <ProfileMenuOption
          icon={<Bell size={20} color={colors.primary} />}
          title="Notifications"
          onPress={() => router.push('/notifications-settings')}
        />
        
        <ProfileMenuOption
          icon={<HelpCircle size={20} color={colors.primary} />}
          title="Help & Support"
          onPress={() => router.push('/support')}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.danger + '10' }]}
        onPress={logout}
      >
        <LogOut size={20} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
      </TouchableOpacity>
      
      <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});