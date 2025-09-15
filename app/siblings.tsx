import { Alert, Button, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import API from '../lib/api';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleNextStep } from '../lib/regNav';


const Siblings = () => {

    const [ageBrackets, setAgeBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siblingsNumber, setSiblingsNumber] = useState('');
  const [siblingsData, setSiblingsData] = useState([]);
   const [userId, setUserId] = useState('');
    const [nextStep, setNextStep] = useState('');



  const handleSiblingsNumberChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setSiblingsNumber(cleaned);

    const count = parseInt(cleaned || '0', 10);
    const updated = Array.from({ length: count }, (_, i) => ({
      firstname: '',
      othername: '',
      age_bracket_id: '',
      phonenumber: '',
    }));

    setSiblingsData(updated);
  };

  const validateForm = () => {
  if (!siblingsNumber || parseInt(siblingsNumber, 10) !== siblingsData.length) {
    Alert.alert('Validation Error', 'Please enter a valid number of siblings.');
    return false;
  }

  for (let i = 0; i < siblingsData.length; i++) {
    const sibling = siblingsData[i];
    if (!sibling.firstname || !sibling.phonenumber || !sibling.age_bracket_id) {
      Alert.alert('Validation Error', `Fill all required fields for sibling ${i + 1}`);
      return false;
    }
  }

  return true;
};


  const handleSiblingChange = (index, field, value) => {
    const updated = [...siblingsData];
    updated[index][field] = value;
    setSiblingsData(updated);


   
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

      const nextStep = await AsyncStorage.getItem('nextStep');
      
      if (nextStep) setNextStep(nextStep);

  if (!validateForm()) return;

  const remainingStepsString = await AsyncStorage.getItem('remainingSteps');
      const remainingSteps = remainingStepsString ? JSON.parse(remainingStepsString) : [];
  

  const fullData = {
        user_id: userId, 
      siblings: siblingsData,
    };

  try {
    const response = await API.post('/siblings',  fullData );

    if (response.data.success) {
      const { next,  remainingSteps: updatedRemaining } = response.data;

      await AsyncStorage.setItem('next', JSON.stringify(next));
      await AsyncStorage.setItem('remainingSteps', JSON.stringify(updatedRemaining || []));



       // ✅ Save next steps to AsyncStorage
      if (Array.isArray(next)) {
        await AsyncStorage.setItem('nextSteps', JSON.stringify(next));
      } else {
        await AsyncStorage.removeItem('nextSteps'); // in case it's done
      }
      
      Alert.alert('Success', 'Saved successfully!');
     await handleNextStep('siblings', response.data);
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
                style={{ flex: 1, paddingVertical: 25, backgroundColor: '#121212'  }}
              >
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Siblings Registration</Text>
      <TextInput
        value={siblingsNumber}
        onChangeText={handleSiblingsNumberChange}
        keyboardType="numeric"
        placeholder="Number of siblings"
        style={styles.input}
        placeholderTextColor="#9ca3af"
        selectionColor="#34C759"
      />

      {siblingsData.map((sibling, index) => (
        <View key={index} style={styles.siblingSection}>
          <Text>Sibling {index + 1}</Text>

          <TextInput
            placeholder="Firstname"
            value={sibling.firstname}
            onChangeText={(text) => handleSiblingChange(index, 'firstname', text)}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

          <TextInput
            placeholder="Othername"
            value={sibling.othername}
            onChangeText={(text) => handleSiblingChange(index, 'othername', text)}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

          <TextInput
            placeholder="Phone number"
            value={sibling.phonenumber}
            onChangeText={(text) => handleSiblingChange(index, 'phonenumber', text)}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

          <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sibling.age_bracket_id}
            onValueChange={(value) => handleSiblingChange(index, 'age_bracket_id', value)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Select age bracket" value=""  color="#9ca3af"/>
            {ageBrackets.map((bracket) => (
              <Picker.Item key={bracket.id} label={bracket.name} value={bracket.id} />
            ))}
          </Picker>
          </View>
        </View>
      ))}

      <Button title="Next" onPress={handleNext} />
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Siblings

const styles = StyleSheet.create({
    container: { padding: 16 },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  input: {
    marginBottom: 15,
  borderWidth: 1,
  borderColor: '#aaa',
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#121212',
  color: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
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


  siblingSection: {
    marginBottom: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
})