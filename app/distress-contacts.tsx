import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import API from '../lib/api';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleNextStep } from '../lib/regNav';

 const DistressContacts = () => {

    const [contacts, setContacts] = useState([
  { group: '', selectedPerson: null, people: [] },  // Contact 1
  { group: '', selectedPerson: null, people: [] },  // Contact 2
  { group: '', selectedPerson: null, people: [] },  // Contact 3
]);
const [userId, setUserId] = useState();
const [nextStep, setNextStep] = useState('');


  const groupOptions = [
    { label: 'Partner', value: 'partner' },
    { label: 'Siblings', value: 'siblings' },
    { label: 'Children', value: 'children' },
    { label: 'Parent', value: 'parents' },
  ];

  const handleGroupChange = async (index, value) => {
    const updated = [...contacts];
    updated[index].group = value;
    updated[index].selectedPerson = null;
    updated[index].people = [];

    try {
      const response = await API.get(`/relationships/${value}?user_id=${userId}`);
      updated[index].people = response.data;
    } catch (error) {
      Alert.alert('Error', 'Failed to load people for selected group.');
      console.error(error);
    }

    setContacts(updated);
  };

  const handlePersonSelect = (index, person) => {
    const updated = [...contacts];
    updated[index].selectedPerson = person;
    setContacts(updated);
  };


const handleSubmit = async () => {

  const userId = await AsyncStorage.getItem('userId');
     
      setUserId(userId);
       const nextStep = await AsyncStorage.getItem('nextStep');
      if (nextStep) setNextStep(nextStep);


    const payload = contacts.map((c, index) => ({
      user_id: userId,
      relation_type: c.group,
      relation_id: c.selectedPerson.id,
      contact_index: index + 1
    }));


      try {
    const response = await API.post('/distress-contacts', { contacts: payload });


     if (response.status === 201) {

      const { next, userId, remainingSteps: updatedRemaining } = response.data;

      await AsyncStorage.setItem('userId', userId.toString());
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
    console.error(err);
    Alert.alert('Error', 'Failed to save contacts.');
  }
};


  return (
     <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, paddingVertical: 25, backgroundColor: '#121212'  }}
                  >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View>
                <Text style={styles.heading}>
                    Select Contact person in case you are in distress. Select in order of preference 
                </Text>
            </View>
        <View>
           {contacts.map((contact, index) => (
          <View key={index} style={styles.contactBlock}>
            <Text style={styles.contactTitle}>Contact {index + 1}</Text>

            <Picker
              selectedValue={contact.group}
              onValueChange={(value) => handleGroupChange(index, value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Group" value="" />
              {groupOptions.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>

            {contact.people.length > 0 && (
              <View>
                {contact.people.map((person) => (
                  <TouchableOpacity
                    key={person.id}
                    onPress={() => handlePersonSelect(index, person)}
                    style={[
                      styles.personItem,
                      contact.selectedPerson?.id === person.id && styles.personSelected,
                    ]}
                  >
                    <Text style={styles.personText}>
                      {person.firstname} {person.surname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Save Contacts</Text>
        </TouchableOpacity>

    </View>


      


</ScrollView>
  </KeyboardAvoidingView>
  

  )
}
export default DistressContacts
const styles = StyleSheet.create({
    container: {  padding: 16,
    paddingBottom: 40, },

  input: {
    marginBottom: 15,
  borderWidth: 1,
  borderColor: '#aaa',
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#1b381c',
  color: '#aaaaaa',
  },

  heading: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '600',
  
    color: '#ffffff',
    padding: 2,
  },

   contactBlock: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 12,
    color: '#ffffff',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#ffffff',
  },
  picker: {
    backgroundColor: '#aaaa99',
    borderRadius: 8,
    marginBottom: 8,
  },
  personItem: {
    padding: 10,
    backgroundColor: '#ddd',
    marginBottom: 5,
    borderRadius: 6,
  },
  personSelected: {
    backgroundColor: '#4CAF50',
  },
  personText: {
    fontSize: 15,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#008000',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})