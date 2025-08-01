import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import API from '../lib/api';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { goToNextStep, handleNextStep } from '../lib/regNav';


const partner = () => {

    const [ageBrackets, setAgeBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnersNumber, setPartnersNumber] = useState('');
  const [partnersData, setPartnersData] = useState([]);
   const [userId, setUserId] = useState('');
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

//  useEffect(() => {
//   const loadUserId = async () => {
//     const storedId = await AsyncStorage.getItem('userId');
//     if (storedId) setUserId(parseInt(storedId));
//   };
//   loadUserId();
// }, []);




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

  const userId = await AsyncStorage.getItem('userId');
  setUserId(userId);
  const remainingStepsString = await AsyncStorage.getItem('remainingSteps');
  const remainingSteps = remainingStepsString ? JSON.parse(remainingStepsString) : [];

  const fullData = {
    user_id: userId,
    partners: partnersData,
    remainingSteps: remainingSteps,
  };

  try {
    const response = await API.post('/partners', fullData);

    if (response.status === 201) {
      const { next, userId, remainingSteps: updatedRemaining } = response.data;

      await AsyncStorage.setItem('userId', userId.toString());
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
     <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      <View style={{ height: 30 }}/>
      <TextInput
        value={partnersNumber}
        onChangeText={handlepartnersNumberChange}
        keyboardType="numeric"
        placeholder="Number of partner"
        style={styles.input}
      />

      {partnersData.map((partner, index) => (
        <View key={index} style={styles.partnersection}>
          <Text>partner {index + 1}</Text>

          <TextInput
            placeholder="Firstname"
            value={partner.firstname}
            onChangeText={(text) => handlePartnerChange(index, 'firstname', text)}
            style={styles.input}
          />

          <TextInput
            placeholder="Othername"
            value={partner.othername}
            onChangeText={(text) => handlePartnerChange(index, 'othername', text)}
            style={styles.input}
          />

          <TextInput
            placeholder="Phone number"
            value={partner.phonenumber}
            onChangeText={(text) => handlePartnerChange(index, 'phonenumber', text)}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Picker
            selectedValue={partner.age_bracket_id}
            onValueChange={(value) => handlePartnerChange(index, 'age_bracket_id', value)}
            style={styles.input}
          >
            <Picker.Item label="Select age bracket" value="" style={styles.pickerItem}/>
            {ageBrackets.map((bracket) => (
              <Picker.Item key={bracket.id} label={bracket.name} value={bracket.id} />
            ))}
          </Picker>
        </View>
      ))}

      <Button title="Next" onPress={handleNext} />
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default partner

const styles = StyleSheet.create({
    container: { padding: 16 },
  input: {
    marginBottom: 15,
  borderWidth: 1,
  borderColor: '#aaa',
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#1b381c',
  color: '#ffffff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#1b381c',
  
    marginVertical: 8,
     padding: 12,
  borderRadius: 8,
  },

  pickerItem: {
 backgroundColor: '#1b381c',
 padding: 12,
  borderRadius: 8,
  },
  partnersection: {
    marginBottom: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
})