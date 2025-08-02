import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  base_price: number;
}

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

// Service category to image mapping
const getServiceImage = (category: string, serviceName: string): string => {
  const categoryImages: { [key: string]: string } = {
    maintenance: 'https://images.pexels.com/photos/5534614/pexels-photo-5534614.jpeg',
    repair: 'https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg',
    cleaning: 'https://images.pexels.com/photos/5762255/pexels-photo-5762255.jpeg',
    tires: 'https://images.pexels.com/photos/6977931/pexels-photo-6977931.jpeg',
    inspection: 'https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg',
    battery: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
    electrical: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
  };

  // Return category-specific image or default maintenance image
  return categoryImages[category.toLowerCase()] || categoryImages.maintenance;
};

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { colors } = useTheme();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: colors.card, borderColor: colors.border },
        Platform.OS === 'web' && styles.webContainer
      ]}
      onPress={onPress}
      accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
      accessibilityLabel={`${service.name} service, starting from ${formatPrice(service.base_price)}`}
    >
      <Image 
        source={{ uri: getServiceImage(service.category, service.name) }} 
        style={styles.image} 
        accessibilityRole={Platform.OS === 'web' ? 'img' : undefined}
        alt={`${service.name} service`}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {service.name}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          From {formatPrice(service.base_price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === 'web' ? 200 : 160,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
  },
  webContainer: {
    marginBottom: 16,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});