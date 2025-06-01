import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProfileMenuOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export default function ProfileMenuOption({ 
  icon, 
  title, 
  subtitle, 
  onPress 
}: ProfileMenuOptionProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.iconBackground }]}>
        {icon}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});