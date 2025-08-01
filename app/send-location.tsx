import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { startLocationUpdates } from '../lib/background';

export default function SendLocation() {
  useEffect(() => {
    startLocationUpdates();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Live tracking started...</Text>
    </View>
  );
}
