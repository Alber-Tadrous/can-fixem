import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  base_price: number;
}

interface ServiceListItemProps {
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

export default function ServiceListItem({ service, onPress }: ServiceListItemProps) {
  const { colors } = useTheme();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Image 
        source={{ uri: getServiceImage(service.category, service.name) }} 
        style={styles.image} 
      />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {service.name}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text 
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {service.description}
        </Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.durationContainer}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={[styles.duration, { color: colors.textSecondary }]}>
              {formatDuration(service.duration)}
            </Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              From
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatPrice(service.base_price)}
            </Text>
            <ChevronRight size={20} color={colors.textSecondary} />
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
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 120,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 4,
  },
  categoryText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});