import {
  StyleSheet,
  TextInput,
  Button,
  Text,
  ScrollView,
  View,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router} from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

import API from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleNextStep } from '../lib/regNav';

const VerifyPhoneNumber = () => {
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);
  const [userId, setUserId] = useState();
  const [userEmail, setUserEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  


  // Fetch current user info
  useEffect(() => {
    const fetchStatus = async () => {
      try {
         const userPhonenumber = await AsyncStorage.getItem('userPhonenumber');
         const userId = await AsyncStorage.getItem('userId');
        const userEmail = await AsyncStorage.getItem('userEmail');
        
        
        setUserPhoneNumber(userPhonenumber);
        setUserId(userId);
        setUserEmail(userEmail);

        const response = await API.post(`/resend-smsotp`, {
        userId: userId,
        phonenumber: userPhoneNumber,
      });
       
      } catch (err) {
        console.log('Phone number is:'+ userPhoneNumber);
        console.log('User ID is:'+ userId);
        console.log('User Email is:'+ userEmail);
        console.error('Failed to fetch status', err);
        Alert.alert('Error', 'Could not fetch verification status');
      }
    };
    fetchStatus();
  }, []);
 

  // ✅ Handle phone number update
  const updatePhoneNumber = async () => {
    try {
      const response = await API.post(`/update-phoneNumber`, {
        phonenumber: newPhoneNumber,
        userId: userId,
        userEmail: userEmail,
      });
      if (response.data.success) {
        Alert.alert('Success', 'Phone number updated. Please check your SMS for a verification code.');
        setUserPhoneNumber(newPhoneNumber);
        setShowUpdate(false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update phone number');
      }
    } catch (err) {
      console.error('Update phone number error', err);
      Alert.alert('Error', 'Phone number update failed');
    }
  };


  // ✅ Handle phone number update
  const resendSmsToken = async () => {
    try {
      const response = await API.post(`/resend-smsotp`, {
        userId: userId,
        phonenumber: userPhoneNumber,
      });
      if (response.data.success) {
        Alert.alert('Success', 'New OTP resend. Please check your SMS for a verification code.');
        
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('OTP resend failed.', err);
      Alert.alert('Error', 'OTP  failed to resend');
    }
  };
        

  const decodePayload = async () => {
  if (params.payload) {
    try {
      const decoded = JSON.parse(atob(params.payload));

      const itemsToStore = [];

      if (decoded?.userId) itemsToStore.push(['userId', decoded.userId.toString()]);
      if (decoded?.userEmail) itemsToStore.push(['userEmail', decoded.userEmail]);
      if (decoded?.userPhonenumber) itemsToStore.push(['userPhonenumber', decoded.userPhonenumber]);
      if (decoded?.registrationComplete !== undefined) itemsToStore.push(['registrationComplete', decoded.registrationComplete.toString()]);
      if (decoded?.next) itemsToStore.push(['next', decoded.next]);

      if (itemsToStore.length > 0) {
        await AsyncStorage.multiSet(itemsToStore);
      }
    } catch (err) {
      console.warn('Invalid payload format', err);
    }
  }
};


  // ✅ Handle phone verification
  const verifyPhoneNumber = async () => {
    try {

      setLoading(true);

console.log({ token: verificationCode, userId });
// ... API call

if (!verificationCode.trim()) {
  Alert.alert('Error', 'Please enter the verification code.');
  return;
}




      const response = await API.post(`/verify-phoneNumber`, {
        token: verificationCode,
        userId: userId,
        userEmail: userEmail,
      });
      
      setLoading(false);
      if (response.data.success) {
        Alert.alert('Success', 'Phone number verified.');
      //   await AsyncStorage.setItem('registrationComplete', 'false');
      // const next = await AsyncStorage.getItem('next');

      await handleNextStep('verify-phone', response.data);
    
  // router.replace('/personal-details'); // or pull `next` from AsyncStorage
      } else {
        Alert.alert('Error', response.data.message || 'Failed to verify phone number');
      }
    } catch (err) {
      console.error('Verify phone number error', err);
      Alert.alert('Error', 'Verification failed');
    }
  };

  return (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#121212' }}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Verify Phone Number</Text>

      <Text style={styles.text}>
        Check your SMS on <Text style={styles.bold}>{userPhoneNumber || 'your registered number'}</Text> for the verification code.
      </Text>

      <Text style={styles.subTitle}>Enter verification code</Text>
      <TextInput
        placeholder="Verification code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        style={styles.input}
        keyboardType="number-pad"
        autoFocus
        returnKeyType="done"
      />
<View>
      <Button title="Verify" onPress={verifyPhoneNumber} />
</View>
<View>
      
      <Button title="Resend" onPress={resendSmsToken} />
</View>
      <Text style={styles.text}>If this phone number is incorrect, update it below:</Text>
      <Button title="Update Phone Number" onPress={() => setShowUpdate(true)} />

      {showUpdate && (
        <>
          <Text style={styles.subTitle}>Enter New Phone Number</Text>
          <TextInput
            placeholder="Phone Number"
            value={newPhoneNumber}
            onChangeText={setNewPhoneNumber}
            style={styles.input}
            keyboardType="number-pad"
          />
          <Button title="Update Phone number" onPress={updatePhoneNumber} disabled={loading} />
        </>
      )}
    </ScrollView>
  </KeyboardAvoidingView>
);

};

export default VerifyPhoneNumber;

const styles = StyleSheet.create({
  scrollContainer: {
  padding: 20,
  borderColor: 'red',
  borderWidth: 1,
},
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
    marginTop: 30,
  },
  subTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
    color: 'white',
  },
  text: {
    color: 'white',
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
});
