import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Filter, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useServices } from '@/hooks/useServices';
import PageHeader from '@/components/ui/PageHeader';
import ServiceListItem from '@/components/services/ServiceListItem';
import CategoryButton from '@/components/services/CategoryButton';

const categories: { id: string; name: string; icon: string }[] = [
  { id: 'all', name: 'All', icon: 'All' },
  { id: 'maintenance', name: 'Maintenance', icon: 'Maintenance' },
  { id: 'repair', name: 'Repairs', icon: 'Repair' },
  { id: 'cleaning', name: 'Cleaning', icon: 'Cleaning' },
  { id: 'tires', name: 'Tires', icon: 'Tires' },
  { id: 'inspection', name: 'Inspection', icon: 'Inspection' },
  { id: 'battery', name: 'Battery', icon: 'Battery' },
  { id: 'electrical', name: 'Electrical', icon: 'Electrical' },
];

export default function ServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { services, loading, error, refetch, getServicesByCategory } = useServices();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = getServicesByCategory(selectedCategory);

  const handleRetry = () => {
    refetch();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader title="Services" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading services...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PageHeader title="Services" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Unable to load services
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
          >
            <RefreshCw size={20} color="white" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
        </Text>
        <TouchableOpacity 
          style={[styles.filterButton, { borderColor: colors.border }]}
          onPress={() => {/* Open filter modal */}}
        >
          <Filter size={18} color={colors.text} />
          <Text style={[styles.filterText, { color: colors.text }]}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No services found
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            {selectedCategory === 'all' 
              ? 'No services are currently available.' 
              : `No services found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
            }
          </Text>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={handleRetry}
          >
            <RefreshCw size={20} color="white" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: 'white',
  },
  servicesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
});