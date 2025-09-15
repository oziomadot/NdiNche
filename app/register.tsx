import {
  StyleSheet,
  TextInput,
  Button,
  Text,
  ScrollView,
  View,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useRegister } from '../context/RegisterContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import API from '../lib/api';
import { handleNextStep } from '../lib/regNav';

const Register = () => {
  

  const { registerData, setRegisterData, updateRegisterData } = useRegister();
  const [showDatePicker, setShowDatePicker] = useState(false);
 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
const getPasswordStrength = (password: string) => {
  if (password?.length > 10 && /\W/.test(password)) return 'Strong';
  if (password?.length >= 6) return 'Medium';
  return 'Weak';
};

const passwordStrength = getPasswordStrength(registerData.password);
const strengthColor = {
  Weak: 'red',
  Medium: 'orange',
  Strong: 'green',
}[passwordStrength];




  

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  const validateForm = () => {
    const {
      surname,
      firstname,
      othername,
      email,
      password,
      passwordRepeat,
      dob,
      
      phonenumber,
      whatsappnumber,
      
    } = registerData;

    if(password !== passwordRepeat){
      Alert.alert('Validation Error', 'Password does not match');
      return false;
    }

    if (
      !surname ||
      !firstname ||
      !email ||
      !password ||
      !dob ||
      
      !phonenumber ||
      !whatsappnumber 
    ) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Enter a valid email address.');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters.');
      return false;
    }

    if (!/^\d{11}$/.test(phonenumber)) {
      Alert.alert('Validation Error', 'Phone number must be 11 digits.');
      return false;
    }

   
    if (!/^\d{11}$/.test(whatsappnumber)) {
      Alert.alert('Validation Error', 'Whatsapp number must be 11 digits.');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    try {
    setLoading(true);

   // Submit form data to backend
    const res = await API.post('/register', registerData);
    console.log('res', res.data);
    // Update context if needed
    updateRegisterData(registerData);

    // Save & navigate to next screen from backend
    await handleNextStep('register', res.data);
  } catch (error) {
    
       

      // Laravel validation error (422)
      if (error.response) {
  const { data } = error.response;

  if (data.errors) {
    const errorMessages = Object.values(data.errors)
      .flat()
      .join('\n');
    Alert.alert('Validation Error', errorMessages);
  } else {
    Alert.alert('Error', data.message || 'An error occurred');
  }
  } else {
      Alert.alert('Network Error', 'Check your internet connection.');
    }
  }
   finally {
    setLoading(false);
  }
  
  };

  return (
     <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1, paddingTop: 10, backgroundColor: '#121212'  }}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Registration </Text>
      <TextInput
        placeholder="Surname"
        value={registerData.surname}
        onChangeText={(text) => setRegisterData({ ...registerData, surname: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Firstname"
        value={registerData.firstname}
        onChangeText={(text) => setRegisterData({ ...registerData, firstname: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Othername"
        value={registerData.othername}
        onChangeText={(text) => setRegisterData({ ...registerData, othername: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={registerData.email}
        onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry={!showPassword}
        value={registerData.password}
        onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        
      />
      {/* /Hide / Show password */}
       <Pressable onPress={() => setShowPassword((prev) => !prev)}>
        <Text style={{ color:'white' }}>{showPassword ? 'Hide' : 'Show'} Password</Text>
      </Pressable>


{/* Show password strength */}
      <View style={{ marginBottom: 10 }}>
  <Text style={{ color: strengthColor }}>
    Password Strength: {passwordStrength}
  </Text>

  <TextInput
        placeholder="Repeat Password"
        secureTextEntry={!showPassword}
        value={registerData.passwordRepeat}
        onChangeText={(text) => setRegisterData({ ...registerData, passwordRepeat: text })}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        
      />
</View>
     

      <Pressable onPress={() => setShowDatePicker(true)}>
        <TextInput
          placeholder="Date of Birth"
          value={registerData.dob ? formatDate(registerData.dob) : ''}
          editable={false}
          style={styles.input}
        />
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={registerData.dob ? new Date(registerData.dob) : new Date()}
          mode="date"
          display="default"
         onChange={(event, selectedDate) => {
          setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
            setRegisterData((prev) => ({
              ...prev,
              dob: selectedDate.toISOString(),
    }));
  }
}}

        />
      )}

      
     <View style={{ flexDirection: 'row', gap: 10 }}>
  <TextInput
    placeholder="Phone number"
    value={registerData.phonenumber}
    onChangeText={(text) =>
      setRegisterData({ ...registerData, phonenumber: text })
    }
    style={[styles.input, { flex: 1 }]}
    keyboardType="number-pad"
  />
  <TextInput
    placeholder="WhatsApp"
    value={registerData.whatsappnumber}
    onChangeText={(text) =>
      setRegisterData({ ...registerData, whatsappnumber: text })
    }
    style={[styles.input, { flex: 1 }]}
    keyboardType="number-pad"
  />
</View>

      
     

     <Button
  title={loading ? 'Submitting...' : 'Next'}
  onPress={handleNext}
  disabled={
    loading ||
    !registerData.surname ||
    !registerData.firstname ||
    !registerData.password
  }
/>

    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;

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
  backgroundColor: '#1b381c',
  color: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
   textAlign: 'center',   // ✅ centers the text
  marginTop: 30,         // ✅ adds spacing from top
  },
});



