import { Alert, Button, KeyboardAvoidingView, Platform, 
  ScrollView, StyleSheet, Text, TextInput, View, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import API from '../lib/api';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleNextStep } from '../lib/regNav';
import { StatusBar } from 'expo-status-bar';


const partner = () => {

    const [ageBrackets, setAgeBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnersNumber, setPartnersNumber] = useState('');
  const [partnersData, setPartnersData] = useState([]);
   const [userId, setUserId] = useState(null);
    const [nextStep, setNextStep] = useState('');



  const handlepartnersNumberChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPartnersNumber(cleaned);

    const count = parseInt(cleaned || '0', 10);
    const updated = Array.from({ length: count }, (_, i) => ({
      firstname: '',
      othername: '',
      age_bracket_id: '',
      phonenumber: '',
    }));

    setPartnersData(updated);
  };

  const validateForm = () => {
  if (!partnersNumber || parseInt(partnersNumber, 10) !== partnersData.length) {
    Alert.alert('Validation Error', 'Please enter a valid number of partners.');
    return false;
  }

  for (let i = 0; i < partnersData.length; i++) {
    const partner = partnersData[i];
    if (!partner.firstname || !partner.phonenumber || !partner.age_bracket_id) {
      Alert.alert('Validation Error', `Fill all required fields for partner ${i + 1}`);
      return false;
    }
  }

  return true;
};


  const handlePartnerChange = (index, field, value) => {
    const updated = [...partnersData];
    updated[index][field] = value;
    setPartnersData(updated);


   
  };

useEffect(() => {
  const loadUserId = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      console.log('Retrieved userId from AsyncStorage:', storedId);
      if (storedId && storedId !== 'null') {
        setUserId(storedId);
      } else {
        console.error('UserId not found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading userId:', error);
    }
  };
  loadUserId();
}, []);




  useEffect(() => {
    const fetchAgeBrackets = async () => {
      try {
        const response = await API.get('/age-brackets');
        setAgeBrackets(response.data); // assuming it's an array
      } catch (error) {
        console.error('Failed to fetch age brackets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeBrackets(); }, 
    []);

const handleNext = async () => {
  if (!validateForm()) return;

  // Check if userId is available
  if (!userId || userId === 'null') {
    Alert.alert('Error', 'User ID is missing. Please restart the registration process.');
    return;
  }

  console.log('Using userId for partner submission:', userId);
  
  const remainingStepsString = await AsyncStorage.getItem('remainingSteps');
  const remainingSteps = remainingStepsString ? JSON.parse(remainingStepsString) : [];

  const fullData = {
    user_id: userId,
    partners: partnersData,
    remainingSteps: remainingSteps,
  };

  try {
    const response = await API.post('/partners', fullData);

    if (response.data.success) {
      console.log('Saved successfully:', response.data);
      const { next,  remainingSteps: updatedRemaining } = response.data;

      await AsyncStorage.setItem('next', JSON.stringify(next));
      await AsyncStorage.setItem('remainingSteps', JSON.stringify(updatedRemaining || []));

      if (next) {
        await AsyncStorage.setItem('nextSteps', JSON.stringify(next));
      } else {
        await AsyncStorage.removeItem('nextSteps');
      }

      Alert.alert('Success', 'Saved successfully!');
      await handleNextStep('partner', response.data);
    } else {
      Alert.alert('Error', 'Failed to submit.');
    }
  } catch (err) {
    Alert.alert('Error', err.message);
  }
};




  return (
    <SafeAreaView style={styles.safeArea}>  
  
     <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1,  padding: 20, backgroundColor: '#121212' }}
              >
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      <View style={{ height: 20 }}/>

      <Text style={styles.title}>Partner Information</Text>
      <TextInput
        value={partnersNumber}
        onChangeText={handlepartnersNumberChange}
        keyboardType="numeric"
        placeholder="Number of partner"
        style={styles.input}
        placeholderTextColor="#9ca3af"
        selectionColor="#34C759"
      />

      {partnersData.map((partner, index) => (
        <View key={index} style={styles.partnersection}>
          <Text>partner {index + 1}</Text>

          <TextInput
            placeholder="Firstname"
            value={partner.firstname}
            onChangeText={(text) => handlePartnerChange(index, 'firstname', text)}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

          <TextInput
            placeholder="Othername"
            value={partner.othername}
            onChangeText={(text) => handlePartnerChange(index, 'othername', text)}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

          <TextInput
            placeholder="Phone number"
            value={partner.phonenumber}
            onChangeText={(text) => handlePartnerChange(index, 'phonenumber', text)}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />
  <View style={styles.pickerContainer}>
          <Picker
            selectedValue={partner.age_bracket_id}
            onValueChange={(value) => handlePartnerChange(index, 'age_bracket_id', value)}
            style={styles.input}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Select age bracket" value="" style={styles.pickerItem}/>
            {ageBrackets.map((bracket) => (
              <Picker.Item key={bracket.id} label={bracket.name} value={bracket.id} />
            ))}
          </Picker>
          </View>
        </View>
      ))}

      <Button title="Next" onPress={handleNext} />
    </ScrollView>
    <View style={{ height: 20 }}/>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default partner

const styles = StyleSheet.create({
    container: { padding: 16, 
      backgroundColor: '#121212' },
      safeArea: {
        flex: 1,
        backgroundColor: "#fff",
      },
  input: {
    marginBottom: 15,
  borderWidth: 2,
  borderColor: '#aaa',
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#121212',
  color: '#fff',
  },
  pickerContainer: {
    borderWidth: 2, 
    borderColor: '#ccc', 
    borderRadius: 8,  
    justifyContent: 'center',
    marginVertical: 10,
  },
  picker: {
    color: '#fff',
    backgroundColor: '#121212',
  },


  partnersection: {
    marginBottom: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  title: {
    marginBottom: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f8f1ff',
    textAlign: 'center',
  }

})