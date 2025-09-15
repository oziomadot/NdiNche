import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, 
  StyleSheet, Text, TextInput, View, SafeAreaView} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../lib/api';
import { router } from 'expo-router';
import { handleNextStep } from '../lib/regNav';




 const ChildrenScreen = () => {

  const [ageBrackets, setAgeBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childrenNumber, setChildrenNumber] = useState('');
  const [childrenData, setChildrenData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [nextStep, setNextStep] = useState('');


  const handleChildrenNumberChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setChildrenNumber(cleaned);

    const count = parseInt(cleaned || '0', 10);
    const updated = Array.from({ length: count }, (_, i) => ({
      firstname: '',
      othername: '',
      age_bracket_id: null,
      phonenumber: '',
    }));

    setChildrenData(updated);
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
  

  const handleChildChange = (index, field, value) => {
    const updated = [...childrenData];
    updated[index][field] = value;
    setChildrenData(updated);
  };

  


    const validateForm = () => {
  if (!childrenNumber || parseInt(childrenNumber, 10) !== childrenData.length) {
    Alert.alert('Validation Error', 'Please enter valid number of children.');
    return false;
  }

  for (let i = 0; i < childrenData.length; i++) {
    const child = childrenData[i];
    if (!child.firstname  || !child.age_bracket_id ) {
      Alert.alert('Validation Error', `Please fill all fields for child ${i + 1}.`);
      return false;
    }
  }

  return true;
};




  const handleNext = async () => {

    
      const nextStep = await AsyncStorage.getItem('nextStep');
      
      if (nextStep) setNextStep(nextStep);
    
    
      if(!validateForm()) return;
      const remainingStepsString = await AsyncStorage.getItem('remainingSteps');
      const remainingSteps = remainingStepsString ? JSON.parse(remainingStepsString) : [];
  
      const fullData = {
        user_id: userId, 
      children: childrenData,
    };

    try {
      const response = await API.post('/registerchildren', fullData);

       if (response.data.success) {
      const { next, remainingSteps: updatedRemaining } = response.data;

      await AsyncStorage.setItem('next', JSON.stringify(next));
      await AsyncStorage.setItem('remainingSteps', JSON.stringify(updatedRemaining || []));

console.log(response);
      // ✅ Save next steps to AsyncStorage
      if (next) {
        await AsyncStorage.setItem('nextSteps', JSON.stringify(next));
      } else {
        await AsyncStorage.removeItem('nextSteps');
      }


     Alert.alert('Success', 'Registration successful!');
console.log(response.data);
     await handleNextStep('children', response.data );
      } else {
        Alert.alert('Error', 'Registration failed.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  
      
    
    }


  useEffect(() => {
     
  const init = async () => {
    try {
  
      
      const res = await API.get('/age-brackets')
              .then((res) => {
    // console.log('Fetched Age Brackets:', res.data); // ✅ This logs the actual fetched data
    setAgeBrackets(res.data); // state will update asynchronously
    
  })
            .catch((err) => Alert.alert('Error', 'Failed to load Age bracket'));
     

      
    } catch (error) {
      Alert.alert('Error', 'Initialization failed. Please check your network or try again.');
    }
  };

  init();
}, []);


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}
          >
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>Children Registration</Text>
      <TextInput
        value={childrenNumber}
        onChangeText={handleChildrenNumberChange}
        keyboardType="numeric"
        placeholder="Number of children"
        style={styles.input}
        placeholderTextColor="#9ca3af"
        selectionColor="#34C759"
      />

      {childrenData.map((child, index) => (
        <View key={index} style={styles.childSection}>
          <Text>Child {index + 1}</Text>

          <TextInput
            placeholder="Firstname"
            value={child.firstname}
            onChangeText={(text) => handleChildChange(index, 'firstname', text)}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

          <TextInput
            placeholder="Othername"
            value={child.othername}
            onChangeText={(text) => handleChildChange(index, 'othername', text)}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

          <TextInput
            placeholder="Phone number"
            value={child.phonenumber}
            onChangeText={(text) => handleChildChange(index, 'phonenumber', text)}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#9ca3af"
            selectionColor="#34C759"
          />

<View style={styles.pickerContainer}>
          <Picker
            selectedValue={child.age_bracket_id}
            onValueChange={(value) => handleChildChange(index, 'age_bracket_id', value)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Select age bracket" value="" color="#9ca3af"/>
      {ageBrackets.map((item) => (
            <Picker.Item key={item.id} value={item.id} label={item.name} style={styles.pickerItem} color="#9ca3af" />
          ))}

            {/* {Array.isArray(ageBrackets) && ageBrackets.length > 0 &&
  ageBrackets.map((item) => (
    <Picker.Item key={item.id} value={item.id} label={item.name} />
))} */}
          </Picker>
          </View>
        </View>
      ))}

      <Button title="Next" onPress={handleNext} />
    </ScrollView>
    <View style={{ height: 20 }}/>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default ChildrenScreen;
const styles = StyleSheet.create({
  container: { padding: 16 },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {  marginBottom: 15,
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
 
  childSection: {
    marginBottom: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
});