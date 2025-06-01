import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Request } from '@/data/mockData';

interface RequestCardProps {
  request: Request;
  onPress: () => void;
}

export default function RequestCard({ request, onPress }: RequestCardProps) {
  const { colors } = useTheme();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'confirmed':
        return colors.info;
      case 'in-progress':
        return colors.primary;
      case 'completed':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.serviceType, { color: colors.text }]}>{request.serviceType}</Text>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(request.status) + '20' }
          ]}
        >
          <Text 
            style={[
              styles.statusText, 
              { color: getStatusColor(request.status) }
            ]}
          >
            {getStatusText(request.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.dateTimeContainer}>
        <Text style={[styles.dateTime, { color: colors.textSecondary }]}>
          {request.date} at {request.time}
        </Text>
      </View>
      
      {request.provider && (
        <View style={[styles.providerContainer, { borderTopColor: colors.border }]}>
          <Image source={{ uri: request.provider.avatar }} style={styles.providerAvatar} />
          <View style={styles.providerInfo}>
            <Text style={[styles.providerName, { color: colors.text }]}>
              {request.provider.name}
            </Text>
            <Text style={[styles.providerRole, { color: colors.textSecondary }]}>
              Service Provider
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => {/* Navigate to chat */}}
          >
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  serviceType: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  dateTimeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  providerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  providerName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  providerRole: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  contactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: 'white',
  },
});