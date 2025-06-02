import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.step,
                {
                  backgroundColor: index < currentStep ? colors.primary : colors.border,
                },
              ]}
            />
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: index < currentStep - 1 ? colors.primary : colors.border,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>
      <Text style={[styles.stepText, { color: colors.textSecondary }]}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connector: {
    width: 40,
    height: 2,
  },
  stepText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
});