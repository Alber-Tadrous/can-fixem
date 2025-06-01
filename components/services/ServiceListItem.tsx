import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Service } from '@/data/mockData';

interface ServiceListItemProps {
  service: Service;
  onPress: () => void;
}

export default function ServiceListItem({ service, onPress }: ServiceListItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Image source={{ uri: service.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{service.name}</Text>
          <Text style={[styles.duration, { color: colors.textSecondary }]}>~{service.duration} min</Text>
        </View>
        
        <Text 
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {service.description}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            From ${service.startingPrice}
          </Text>
          <ChevronRight size={20} color={colors.textSecondary} />
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
  },
  image: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    flex: 1,
  },
  duration: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
});