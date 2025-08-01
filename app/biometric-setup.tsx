import { Button, Alert, Text, View } from 'react-native'
import React from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import { router } from 'expo-router'

const BiometricSetup = () => {
  const handleSetup = async () => {
    const enrolled = await LocalAuthentication.hasHardwareAsync();
    if(!enrolled){
      Alert.alert('Biometric not supported');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Register fingerprint'});
    if(result.success){
      router.replace('/face-scan');
    }else{
      Alert.alert('Authentication failed');
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      <Text>Set up your fingerprint</Text>
      <Button title="Scan Fingerprint" onPress={handleSetup} />
    </View>
  );
}

export default BiometricSetup
