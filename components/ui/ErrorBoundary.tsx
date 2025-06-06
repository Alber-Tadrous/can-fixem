import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Something went wrong
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {error?.message || 'An unexpected error occurred'}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={retry}
        >
          <RefreshCw size={20} color="white" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
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
});