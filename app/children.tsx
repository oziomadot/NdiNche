import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native'
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
  const [userId, setUserId] = useState();
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

// useEffect(() => {
//   const loadNextStep = async () => {
//     const storedNext = await AsyncStorage.getItem('nextStep');
//     if (storedNext) {
//       setNextStep(storedNext);
//     }
//   };

//   loadNextStep();
// }, []);


  const handleNext = async () => {

    const userId = await AsyncStorage.getItem('userId');
      const nextStep = await AsyncStorage.getItem('nextStep');
      setUserId(userId);
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

       if (response.status === 201) {
      const { next, userId, remainingSteps: updatedRemaining } = response.data;

      await AsyncStorage.setItem('userId', userId.toString());
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
      

      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please complete registration first.');
        return router.replace('/register');
      }

      

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
      <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, paddingVertical: 25, backgroundColor: '#121212' }}
          >
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        value={childrenNumber}
        onChangeText={handleChildrenNumberChange}
        keyboardType="numeric"
        placeholder="Number of children"
        style={styles.input}
      />

      {childrenData.map((child, index) => (
        <View key={index} style={styles.childSection}>
          <Text>Child {index + 1}</Text>

          <TextInput
            placeholder="Firstname"
            value={child.firstname}
            onChangeText={(text) => handleChildChange(index, 'firstname', text)}
            style={styles.input}
          />

          <TextInput
            placeholder="Othername"
            value={child.othername}
            onChangeText={(text) => handleChildChange(index, 'othername', text)}
            style={styles.input}
          />

          <TextInput
            placeholder="Phone number"
            value={child.phonenumber}
            onChangeText={(text) => handleChildChange(index, 'phonenumber', text)}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Picker
            selectedValue={child.age_bracket_id}
            onValueChange={(value) => handleChildChange(index, 'age_bracket_id', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select age bracket" value="" style={styles.pickerItem}/>
 {ageBrackets.map((item) => (
            <Picker.Item key={item.id} value={item.id} label={item.name} style={styles.pickerItem} />
          ))}

            {/* {Array.isArray(ageBrackets) && ageBrackets.length > 0 &&
  ageBrackets.map((item) => (
    <Picker.Item key={item.id} value={item.id} label={item.name} />
))} */}
          </Picker>
       
        </View>
      ))}

      <Button title="Next" onPress={handleNext} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
};


export default ChildrenScreen;
const styles = StyleSheet.create({
  container: { padding: 16 },

  input: {  marginBottom: 15,
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
  childSection: {
    marginBottom: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
});