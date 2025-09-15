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
import { router } from 'expo-router';
import API from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleNextStep } from '../lib/regNav';


const VerifyEmail = () => {
  const [userEmail, setUserEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
      const [emailOtp, setEmailOtp] = useState('');

  // Fetch current email on mount
  useEffect(() => {
    const fetchStatus = async () => {
//      const fetchStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userEmail = await AsyncStorage.getItem('userEmail');

      console.log(userId);
    console.log(userEmail);
      if (!userId || !userEmail) {
        throw new Error('Missing data from AsyncStorage');
      }

      
      setUserEmail(userEmail);
      setUserId(userId);

console.log("userId:", typeof(userId));
      // on mount, fetch email OTP
       const response = await API.post(`/resend-otp`, {
        userId: userId,
        email: userEmail,

      });
    } catch (err) {
      console.error('Failed to load user data', err);
      Alert.alert('Error', 'Could not fetch user info');
    } finally {
      setLoading(false);
    }
 
    };
    fetchStatus();
  }, []);

  const updateEmail = async () => {
    try {
      console.log(userId);
      const response = await API.post(`/user/${userId}`, {
        email: newEmail,
      });
      if (response.data.success) {
        Alert.alert('Success', 'Email updated. Please check your new inbox.');
        setUserEmail(newEmail);
        AsyncStorage.setItem('userEmail', newEmail)
        setShowUpdate(false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update email');
      }
    } catch (err) {
  console.error('Update email error', err.response?.data || err.message);
  Alert.alert('Error', 'Email update failed');
}
  };

  const resendOtp = async () => {
    try {
      
      const response = await API.post(`/resend-otp`, {
        userId: userId,
        email: userEmail,

      });



      if (response.data.success) {
        Alert.alert('Success', 'OTP successfully sent to your email.');
       

        


        
       
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
  console.error('OTP resend failed', err.response?.data || err.message);
  Alert.alert('Error', 'OTP resend failed.');
}
  };

  const verifyEmail = async () => {
    try {
      
      const response = await API.post(`/verify-otp`, {
        emailOtp: emailOtp,
        email: userEmail,

      });

      console.log("we reached here");
      console.log(response.data);

      if (response.data.success) {
        Alert.alert('Success', 'Email Verified. Now verify your phone number');
       
        await handleNextStep('verify-email', response.data);
       
      } else {
        Alert.alert('Error', response.data.message || 'Failed to verify email');
      }
    } catch (err) {
  console.error('Verify email error', err.response?.data || err.message);
  Alert.alert('Error', 'Email verify failed. Try to resend token or update your email');
}
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#121212'  }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Verify Email</Text>

        <Text style={styles.text}>
          Login to <Text style={styles.text}>{userEmail}</Text> to verify your email.
        </Text>

         <TextInput
                placeholder="Enter your OTP"
                value={emailOtp}
                onChangeText={(text) => setEmailOtp(text)}
                style={styles.input}
              />
<View>
              <Button title="Verify" onPress={verifyEmail} />
</View>
<View>


              <Button title="Resend OTP" onPress={resendOtp} />
</View>
        <Text style={styles.text}>
          If this email is incorrect, update it below:
        </Text>

        <Button title="Update Email" onPress={() => setShowUpdate(true)} />

        {showUpdate && (
          <>
            <Text style={styles.subTitle}>Enter New Email</Text>
            <TextInput
              placeholder="Email"
              value={newEmail}
              onChangeText={setNewEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button title="Save & Resend Link" onPress={updateEmail} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#99aaee',
    color: 'black'
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
