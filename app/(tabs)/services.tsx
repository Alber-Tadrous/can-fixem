import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { mockServices, ServiceCategory } from '@/data/mockData';
import PageHeader from '@/components/ui/PageHeader';
import ServiceListItem from '@/components/services/ServiceListItem';
import CategoryButton from '@/components/services/CategoryButton';

const categories: { id: string; name: string; icon: keyof typeof ServiceCategory }[] = [
  { id: 'all', name: 'All', icon: 'All' },
  { id: 'maintenance', name: 'Maintenance', icon: 'Maintenance' },
  { id: 'repair', name: 'Repairs', icon: 'Repair' },
  { id: 'cleaning', name: 'Cleaning', icon: 'Cleaning' },
  { id: 'tires', name: 'Tires', icon: 'Tires' },
  { id: 'inspection', name: 'Inspection', icon: 'Inspection' },
];

export default function ServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = selectedCategory === 'all' 
    ? mockServices 
    : mockServices.filter(service => service.category === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="Services" />
      
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <CategoryButton
              category={item}
              isSelected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
            />
          )}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={[styles.resultText, { color: colors.text }]}>
          {filteredServices.length} services available
        </Text>
        <TouchableOpacity 
          style={[styles.filterButton, { borderColor: colors.border }]}
          onPress={() => {/* Open filter modal */}}
        >
          <Filter size={18} color={colors.text} />
          <Text style={[styles.filterText, { color: colors.text }]}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ServiceListItem
            service={item}
            onPress={() => router.push(`/service/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryContainer: {
    marginTop: 16,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  resultText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  servicesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
});