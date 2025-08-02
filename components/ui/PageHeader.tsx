import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  showBackButton = false, 
  rightElement 
}: PageHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        
        <Text 
          style={[
            styles.title, 
            { color: colors.text },
            showBackButton && styles.titleWithBack
          ]}
          accessibilityRole={Platform.OS === 'web' ? 'heading' : undefined}
          accessibilityLevel={Platform.OS === 'web' ? 1 : undefined}
        >
          {title}
        </Text>
        
        {rightElement && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' && {
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    flex: 1,
  },
  titleWithBack: {
    fontSize: 20,
  },
  rightElement: {
    marginLeft: 'auto',
  },
});