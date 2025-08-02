import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SearchInputProps {
  placeholder: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export default function SearchInput({ placeholder, icon, onPress }: SearchInputProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: colors.inputBackground, borderColor: colors.border },
        Platform.OS === 'web' && styles.webContainer
      ]}
      onPress={onPress}
      accessibilityRole={Platform.OS === 'web' ? 'searchbox' : undefined}
      accessibilityLabel={placeholder}
    >
      {icon}
      <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
        {placeholder}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'border-color 0.2s ease',
    }),
  },
  webContainer: {
    ':hover': {
      borderColor: '#2563EB',
    },
  },
  placeholder: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});