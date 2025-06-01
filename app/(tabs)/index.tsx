import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { MapPin, Search } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import HomeHeader from '@/components/home/HomeHeader';
import ServiceCard from '@/components/home/ServiceCard';
import ProviderCard from '@/components/home/ProviderCard';
import SearchInput from '@/components/ui/SearchInput';
import { mockServices, mockProviders } from '@/data/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [location, setLocation] = useState('San Francisco, CA');
  const [nearbyProviders, setNearbyProviders] = useState(mockProviders);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader 
        username={user?.name || 'Guest'}
        location={location} 
        onLocationPress={() => {/* Open location modal */}}
      />
      
      <SearchInput 
        placeholder="Search for services or providers" 
        icon={<Search size={20} color={colors.textSecondary} />}
        onPress={() => {/* Open search */}}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Services</Text>
            <TouchableOpacity onPress={() => router.push('/services')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {mockServices.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                onPress={() => router.push(`/service/${service.id}`)}
              />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Providers</Text>
            <TouchableOpacity onPress={() => router.push('/providers')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.providersList}>
            {nearbyProviders.slice(0, 4).map((provider) => (
              <ProviderCard 
                key={provider.id}
                provider={provider}
                onPress={() => router.push(`/provider/${provider.id}`)}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.bannerContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg' }}
              style={styles.bannerImage}
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Become a Service Provider</Text>
              <Text style={styles.bannerText}>Earn money by helping people with their car needs</Text>
              <TouchableOpacity 
                style={[styles.bannerButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/provider-signup')}
              >
                <Text style={styles.bannerButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  seeAll: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  horizontalList: {
    paddingRight: 8,
  },
  providersList: {
    gap: 12,
  },
  bannerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bannerContent: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
    height: '100%',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: 'white',
    marginBottom: 8,
  },
  bannerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'white',
    marginBottom: 16,
  },
  bannerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    fontSize: 14,
  },
});