import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Bell } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface HomeHeaderProps {
  username: string;
  location: string;
  onLocationPress: () => void;
}

export default function HomeHeader({ username, location, onLocationPress }: HomeHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hello,</Text>
          <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={colors.text} />
          <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.notificationText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.locationContainer}
        onPress={onLocationPress}
      >
        <MapPin size={16} color={colors.primary} />
        <Text style={[styles.locationText, { color: colors.textSecondary }]}>{location}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  username: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
});