import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { mockRequests } from '@/data/mockData';
import PageHeader from '@/components/ui/PageHeader';
import RequestCard from '@/components/requests/RequestCard';

const statusFilters = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed'];

export default function RequestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filteredRequests = activeFilter === 'All' 
    ? mockRequests 
    : mockRequests.filter(request => request.status === activeFilter.toLowerCase().replace(' ', '-'));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="My Requests" />
      
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === item && { backgroundColor: colors.primary }
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text 
                style={[
                  styles.filterText, 
                  { color: activeFilter === item ? 'white' : colors.textSecondary }
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      {filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No requests found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You don't have any {activeFilter.toLowerCase()} requests yet
          </Text>
          <TouchableOpacity 
            style={[styles.newRequestButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/services')}
          >
            <Text style={styles.newRequestText}>Request a Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.requestsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onPress={() => router.push(`/request/${item.id}`)}
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
  filtersContainer: {
    marginVertical: 16,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  requestsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  newRequestButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newRequestText: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    fontSize: 16,
  },
});