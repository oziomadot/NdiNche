

import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../lib/api';
import { handleNextStep } from '../lib/regNav';
import * as ImageManipulator from 'expo-image-manipulator';

const ID_TYPES = [
  { label: 'National ID (NIN)', value: 'nin', requiresBack: false },
  { label: 'Driver’s License', value: 'drivers_license', requiresBack: true },
  { label: 'Voter’s Card', value: 'voters_card', requiresBack: true },
  { label: 'International Passport', value: 'passport', requiresBack: false },
];

const IdCard = () => {

     const [selectedIdType, setSelectedIdType] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [userId, setUserId] = useState();
  const [nextStep, setNextStep] = useState();

  const requiresBack = ID_TYPES.find((id) => id.value === selectedIdType)?.requiresBack;

  useEffect(() => {
    try {
      console.log('ImageManipulator loaded:', !!ImageManipulator.manipulateAsync);
    } catch (err) {
      console.error('Manipulator import failed:', err);
    }
  }, []);
   
  
    useEffect(() => {
      (async () => {
  
        // const userId = await AsyncStorage.getItem('userId');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permissions are required to use this feature.');
        }
  
        // setUserId();
      })();
    }, []);
  

  const pickImage = async (side) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {

         const originalUri = result.assets[0].uri;

     const manipulatedResult = await ImageManipulator.manipulateAsync(
             originalUri,
              [{ resize: { width: 800 } }],
              { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
         
            );
        
            

      const image = {
        uri: manipulatedResult.uri,
        name: `${side}-image.jpg`,
        type: 'image/jpeg',
      };

      if (side === 'front') setFrontImage(image);
      else if (side === 'back') setBackImage(image);
    }
  };

  const takePhotoWithCamera = async (side) => {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
        const originalUri = result.assets[0].uri;

        

        const manipulatedResult = await ImageManipulator.manipulateAsync(
              originalUri,
              [{ resize: { width: 800 } }],
              { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
         
            );
        
            

      const image = {
        uri: manipulatedResult.uri,
        name: `${side}-image.jpg`,
        type: 'image/jpeg',
      };

      console.log('Original camera image URI:', originalUri);
console.log('Manipulated image URI:', manipulatedResult.uri);


      if (side === 'front') setFrontImage(image);
      else if (side === 'back') setBackImage(image);

      console.log('Front image set:', image);

    }
    }

 const handleSubmit = async () => {
  const userId = await AsyncStorage.getItem('userId');
  setUserId(userId);

  if (!selectedIdType) {
    Alert.alert('Validation', 'Please select ID type.');
    return;
  }

  


  if (!frontImage || (requiresBack && !backImage)) {
    Alert.alert('Validation', 'Please upload required ID image(s).');
    return;
  }

  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('id_type', selectedIdType);
  formData.append('id_front', {
    uri: frontImage.uri,
    name: frontImage.name,
    type: frontImage.type,
  });

  if (requiresBack && backImage) {
    formData.append('id_back', {
      uri: backImage.uri,
      name: backImage.name,
      type: backImage.type,
      
    });
  }

  try {
    const response = await API.post('/upload-id', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { next, userId } = response.data;

    if (response.status === 200 || response.status === 201) {
      await AsyncStorage.setItem('userId', userId.toString());
      await AsyncStorage.setItem('nextSteps', JSON.stringify(next));

      handleNextStep('id-card', response.data);
      Alert.alert('Success', 'ID uploaded successfully');
    } else {
      Alert.alert('Error', 'Upload failed');
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    Alert.alert('Error', 'Network or server error');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Government-Issued ID</Text>

      <Text style={styles.label}>Select ID Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedIdType}
          onValueChange={(value) => {
            setSelectedIdType(value);
            setFrontImage(null);
            setBackImage(null);
          }}
        >
          <Picker.Item label="-- Select ID Type --" value="" />
          {ID_TYPES.map((id) => (
            <Picker.Item key={id.value} label={id.label} value={id.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.label}>Front Image</Text>
        <TouchableOpacity onPress={() => pickImage('front')} style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>Pick Front Image From Gallary</Text>
        </TouchableOpacity>
        <View style={{ height: 10 }}/>
        <Button title="Take Front Image with camera" onPress={() =>takePhotoWithCamera('front')} />
             
        {frontImage && <Image source={{ uri: frontImage.uri }} style={styles.preview} />}
      </View>

      {requiresBack && (
        <View style={styles.uploadSection}>
          <Text style={styles.label}>Back Image</Text>
          <TouchableOpacity onPress={() => pickImage('back')} style={styles.uploadBtn}>
            <Text style={styles.uploadBtnText}>Pick Back Image</Text>
          </TouchableOpacity>

          <View style={{ height: 10 }}/>
        <Button title="Take Front Image with camera" onPress={() =>takePhotoWithCamera('back')} />
             
          {backImage && <Image source={{ uri: backImage.uri }} style={styles.preview} />}
        </View>
      )}

      <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
        <Text style={styles.submitBtnText}>Submit ID</Text>
      </TouchableOpacity>
    </View>
  )
}

export default IdCard

const styles = StyleSheet.create({
    container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1b381c',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#aaa',
    borderRadius: 8,
    marginBottom: 20,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadBtn: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: '#fff',
    textAlign: 'center',
  },
  preview: {
    marginTop: 10,
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  submitBtn: {
    backgroundColor: '#008000',
    padding: 16,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
})