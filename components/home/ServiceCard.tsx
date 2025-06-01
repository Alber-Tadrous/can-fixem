import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Service } from '@/data/mockData';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Image source={{ uri: service.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{service.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>From ${service.startingPrice}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 12,
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
  },
  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});