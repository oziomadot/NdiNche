import { Alert, Button, KeyboardAvoidingView, Platform, SafeAreaView, 
  ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import API from '../lib/api';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';
import { handleNextStep } from '../lib/regNav';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Parents = () => {
const [showFather, setShowFather] = useState(false);
const [showMother, setShowMother] = useState(false);
const [ageBrackets, setAgeBrackets] = useState([]);
const [loading, setLoading] = useState(true);
const [nextStep, setNextStep] = useState('');
  const [userId, setUserId] = useState('');
const [parentsData, setParentsData] = useState([]);

let isValid = true;

  const [father, setFather] = useState({ firstname: '', othername: '', ageBracket: '', phone: '' });
  const [mother, setMother] = useState({ firstname: '', othername: '', ageBracket: '', phone: '' });

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

      const validateForm = () => {
       
      
       parentsData.forEach((parentData, i) => {
          const parent = parentsData[i];
          if (!parent.firstname || !parent.phonenumber || !parent.age_bracket_id) {
            Alert.alert('Validation Error', `Fill all required fields for parents ${i + 1}`);
             isValid = false;
  }
});
 return true;
}

if (!isValid) return false;

      

const handleNext = async () => {
  const dataToSubmit = [];

  
      const nextStep = await AsyncStorage.getItem('nextStep');
    
      if (nextStep) setNextStep(nextStep);

  if (showFather) {
    if (!father.firstname || !father.ageBracket || !father.phone) {
      Alert.alert('Validation Error', 'Please fill all fields for father');
      return;
    }

    dataToSubmit.push({
      firstname: father.firstname,
      othername: father.othername,
      age_bracket_id: father.ageBracket,
      phonenumber: father.phone,
      relationship: 'father',
    });
  }

  if (showMother) {
    if (!mother.firstname || !mother.ageBracket || !mother.phone) {
      Alert.alert('Validation Error', 'Please fill all fields for mother');
      return;
    }

    dataToSubmit.push({
      firstname: mother.firstname,
      othername: mother.othername,
      age_bracket_id: mother.ageBracket,
      phonenumber: mother.phone,
      relationship: 'mother',
    });
  }

  if (dataToSubmit.length === 0) {
    Alert.alert('Validation Error', 'Select at least one parent and fill the details');
    return;
  }

  const fullData = {
    user_id: userId,
    parents: dataToSubmit,
  };

  try {
    const response = await API.post('/parents', fullData);

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
      handleNextStep('parents', response.data);
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
                    style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}
                  >
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Parents Registration</Text>  
      <Text style={styles.subTitle}>Select Parent(s)</Text>

      {/* Checkboxes */}
      <View style={styles.checkboxRow}>
        <Checkbox value={showFather} onValueChange={setShowFather} color={showFather ? '#34C759' : undefined} />
        <Text style={styles.label}>Father</Text>
      </View>

      <View style={styles.checkboxRow}>
        <Checkbox value={showMother} onValueChange={setShowMother} color={showMother ? '#34C759' : undefined} />
        <Text style={styles.label}>Mother</Text>
      </View>

      {/* Father Fields */}
      {showFather && (
        <View style={styles.section}>
          <Text style={styles.subTitle}>Father's Info</Text>
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#9ca3af"
            value={father.firstname}
            onChangeText={(text) => setFather({ ...father, firstname: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Othername"
            placeholderTextColor="#9ca3af"
            value={father.othername}
            onChangeText={(text) => setFather({ ...father, othername: text })}
            style={styles.input}
          />
          <Picker
            selectedValue={father.ageBracket}
            onValueChange={(value) => setFather({ ...father, ageBracket: value })}
            style={styles.picker}>
            <Picker.Item label="Select Age Bracket" value="" />
            {ageBrackets.map((age, index) => (
              <Picker.Item key={age.id} label={age.name} value={age.id} />
            ))}
          </Picker>
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9ca3af"
            value={father.phone}
            onChangeText={(text) => setFather({ ...father, phone: text })}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
      )}

      {/* Mother Fields */}
      {showMother && (
        <View style={styles.section}>
          <Text style={styles.subTitle}>Mother's Info</Text>
          <TextInput
            placeholder="First Name"
            placeholderTextColor="#9ca3af"
            value={mother.firstname}
            onChangeText={(text) => setMother({ ...mother, firstname: text })}
            style={styles.input}
           
            selectionColor="#34C759"
          />
          <TextInput
            placeholder="Othername"
            placeholderTextColor="#9ca3af"
            value={mother.othername}
            onChangeText={(text) => setMother({ ...mother, othername: text })}
            style={styles.input}
          />
          <View style={styles.pickerContainer}>
          <Picker
                      selectedValue={mother.ageBracket}
                      onValueChange={(value) => setMother({...mother, ageBracket: value})}
                      style={styles.picker}
                      dropdownIconColor="#fff"
                    >
                      <Picker.Item label="Select age bracket" value="" />
                      {ageBrackets.map((bracket) => (
                        <Picker.Item key={bracket.id} label={bracket.name} value={bracket.id} />
                      ))}
                    </Picker>
          </View>
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9ca3af"
            value={mother.phone}
            onChangeText={(text) => setMother({ ...mother, phone: text })}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
      )}

      <Button title="Next" onPress={handleNext} />
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )

}
export default Parents

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#ffffff'
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
  subTitle: {
    fontSize: 18,
    marginVertical: 8,
    fontWeight: '600',
    color: '#7cf'
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ffffff'
  },
  section: {
    marginVertical: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
    backgroundColor: '#121212',
    color: '#fff'
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});