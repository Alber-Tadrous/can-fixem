import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
      onPress={onPress}
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
  },
  placeholder: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});