import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CategoryButtonProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  isSelected: boolean;
  onPress: () => void;
}

export default function CategoryButton({ 
  category, 
  isSelected, 
  onPress 
}: CategoryButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isSelected ? colors.primary : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        }
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          styles.text, 
          { color: isSelected ? 'white' : colors.text }
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
});