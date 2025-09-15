import { StyleSheet, Text, View, Button } from 'react-native'
import React, { useEffect } from 'react'
import { router, useRouter } from 'expo-router'
import API from '../lib/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location';


const CheckStatus = () => {
  const router = useRouter();

  const [userId, setUserId] = React.useState(null); // Replace this with the actual method to fetch userId from AsyncStorage

  useEffect(() => {
     const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  const distressAlert = async () => {
    try {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // Send to backend
      await API.post('/distress-alert', {
        userId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

    router.replace('/send-location');
    } catch (error) {
      console.log('Error sending distress alert:', error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you in distress?</Text>
      <View style={styles.button}>
      <Button  title="Yes, send help!" onPress={distressAlert} />
        </View>
        <View style={styles.button}>
        <Button  title="No, I'm safe" onPress={() => {}} />
                  </View>
    </View>
  )
}

export default CheckStatus

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: { fontSize: 22, marginBottom: 20,
    color: 'black',
  },
  button: { marginBottom: 20 }
});