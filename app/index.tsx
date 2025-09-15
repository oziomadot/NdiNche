// // rnfes

// app/index.tsx
import { useEffect, useState } from 'react';
import { router,useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../lib/api';
import { handleNextStep } from '../lib/regNav';
import { useRootNavigationState } from 'expo-router';





// App.js or wherever your NavigationContainer lives
import { NavigationContainer } from '@react-navigation/native';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigationState = useRootNavigationState();
  const router = useRouter();

  // ✅ Moved outside useEffect so both hooks can access it
  const checkRoute = async () => {

      // await AsyncStorage.clear();

  try {
    const token = await AsyncStorage.getItem('auth_token');
    const next = await AsyncStorage.getItem('next');
    const completed = (await AsyncStorage.getItem('registrationCompleted')) === 'true';
    const Iunderstood = (await AsyncStorage.getItem('Iunderstood')) === 'true';
    const Practice = (await AsyncStorage.getItem('Practice')) === 'true';

    console.log('➡️ Next:', next);

    if (!token) {
      if (!completed && next) {
        return router.replace(next);
      } else if (completed && next) {
        if (!Iunderstood) return router.replace('/how-it-works');
        if (!Practice) return router.replace('/practice');
        return router.replace('/distress-check');
      }
      return router.replace('/welcome');
    }
console.log('token:', token);
    // Token exists: check verification
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const res = await API.get('/auth/status');

    if (!res.data.email_verified) {
      return router.replace('/verify-email');
    }
    

    const isComplete = (await AsyncStorage.getItem('registrationCompleted')) === 'true';
    if (isComplete) {
      return router.replace('/check-status');
    }

    const nextScreen = await AsyncStorage.getItem('next');
    return router.replace(nextScreen || '/personal-details');
  } catch (err) {
    console.error('Index redirect error:', err);
    return router.replace('/welcome');
  } finally {
    setLoading(false);
  }
};


  

  // ✅ Runs checkRoute once layout is mounted
  useEffect(() => {
    if (!navigationState?.key) return;
    checkRoute();
  }, [navigationState?.key]);

  

  if (error) {
    return <View><Text>{error}</Text></View>;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading && (
        <>
          <ActivityIndicator size="large" />
          <Text>Redirecting...</Text>
        </>
      )}
    </View>
  );
}
