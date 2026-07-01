import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface FullScreenLoaderProps {
  label?: string;
}

export function FullScreenLoader({
  label = 'Preparing workspace...',
}: FullScreenLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#2E5BFF" size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F6F8FC',
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: '#6E7787',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
});