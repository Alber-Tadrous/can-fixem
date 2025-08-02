import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Provider } from '@/data/mockData';

interface ProviderCardProps {
  provider: Provider;
  onPress: () => void;
}

export default function ProviderCard({ provider, onPress }: ProviderCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: colors.card, borderColor: colors.border },
        Platform.OS === 'web' && styles.webContainer
      ]}
      onPress={onPress}
      accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
      accessibilityLabel={`${provider.name}, ${provider.rating} stars, ${provider.distance} miles away`}
    >
      <Image source={{ uri: provider.avatar }} style={styles.avatar} />
      
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{provider.name}</Text>
          {provider.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        
        <View style={styles.specialtiesContainer}>
          {provider.specialties.slice(0, 2).map((specialty, index) => (
            <View 
              key={index} 
              style={[styles.specialtyBadge, { backgroundColor: colors.badgeBackground }]}
            >
              <Text style={[styles.specialtyText, { color: colors.textSecondary }]}>
                {specialty}
              </Text>
            </View>
          ))}
          {provider.specialties.length > 2 && (
            <Text style={[styles.moreText, { color: colors.textSecondary }]}>
              +{provider.specialties.length - 2}
            </Text>
          )}
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FFB800" fill="#FFB800" />
            <Text style={[styles.ratingText, { color: colors.text }]}>
              {provider.rating} ({provider.reviewCount})
            </Text>
          </View>
          
          <View style={styles.distanceContainer}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
              {provider.distance} miles
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      width: Platform.OS === 'web' ? '48%' : '100%',
      marginBottom: Platform.OS === 'web' ? 12 : 0,
    }),
  },
  webContainer: {
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  verifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: 'white',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialtyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  moreText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});