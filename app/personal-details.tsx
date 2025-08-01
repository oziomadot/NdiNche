import { StyleSheet, Text, View, TextInput, ScrollView, Button, Alert, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect} from 'react';
import { Picker } from '@react-native-picker/picker';
import { Switch } from 'react-native';
import { useRegister } from '../context/RegisterContext'; // ✅ fix import
import API from '../lib/api';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleNextStep } from '../lib/regNav';

import * as ImageManipulator from 'expo-image-manipulator';
// import { FlipType, SaveFormat, useImageManipulator } from 'expo-image-manipulator';



import * as ImagePicker from 'expo-image-picker';



const PersonalDetails = () => {
  // console.log('rending:', 'redering');
  const { registerData, updateRegisterData } = useRegister();

  const [homeAddress, setHomeAddress] = useState('');
  const [residentAddress, setResidentAddress] = useState('');
  const [lgaOrigin, setLgaOrigin] = useState('');
  const [stateOrigin, setStateOrigin] = useState('');
  const [stateResident, setStateResident] = useState('');
  const [lgaResident, setLgaResident] = useState('');
  const [children, setChildren] = useState(false);
  const [siblings, setSiblings] = useState(false);
  const [parents, setParents] = useState(false);
  const [maritalStatus, setMaritalStatus] = useState('');
   const [relationship, setRelationship] = useState([]);
  const [states, setStates] = useState([]);  
  const [lgas, setLgas] = useState([]);
  const [lgasResidentList, setLgasResidentList]= useState([]);
 
  const [userId, setUserId]= useState();




  const [image, setImage] = useState<string | null>(null);



  const [form, setForm] = useState({
  homeaddress: homeAddress,
  residentaddress: residentAddress,
  stateOrigin: stateOrigin,
  lgaOrigin: lgaOrigin,
  stateResident: stateResident,
  lgaResident: lgaResident,
  children: children,
  siblings: siblings,
  parents: parents,
  maritalStatus: maritalStatus,
 
});


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
      // setUserId(userId);

      const userId = await AsyncStorage.getItem('userId');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permissions are required to use this feature.');
      }

      // setUserId();
    })();
  }, []);


 


  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    
    if (!result.canceled) {

      const manipulatedResult = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 800 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    setImage(manipulatedResult.uri); // or whatever you want to do with the image
  };
  }
 
// Optional: Load states and LGAs from API
   // Fetch states
  useEffect(() => {
    API.get('/states')
      .then(res => setStates(res.data))
      .catch(err => Alert.alert('Error', 'Failed to load states'));
  }, []);

    // Fetch LGAs when origin state changes
  useEffect(() => {
    if (stateOrigin) {
      API.get(`/states/${stateOrigin}/lgas`)
        .then(res => setLgas(res.data))
        .catch(() => Alert.alert('Error', 'Failed to load LGAs for origin'));
    }
  }, [stateOrigin]);

  // Fetch LGAs when resident state changes
  useEffect(() => {
    if (stateResident) {
      API.get(`/states/${stateResident}/lgas`)
        .then(res => setLgasResidentList(res.data))
        .catch(() => Alert.alert('Error', 'Failed to load LGAs for residence'));
    }
  }, [stateResident]);

  // Fetch Marital Status when resident state changes
 useEffect(() => {
    try{
    API.get('/relationship')
      .then((res) => {
        setRelationship(res.data);
      })
      .catch((err) => Alert.alert('Error', 'Failed to load marital status'));
    }catch($e){

    }
    }, []);




  const validateForm = () => {
    if (
      !residentAddress ||
      !stateOrigin ||
      !lgaOrigin ||
      !stateResident ||
      !lgaResident ||
      !maritalStatus ||
      !image
    ) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }
    return true;
  };



const handleRegister = async () => {

 
console.log('user Id:', userId);

  if (!validateForm()) return;

  const fullData = new FormData();

  // const userId = await AsyncStorage.getItem('userId');

  if (image) {

     Image.getSize(image, 
  (width, height) => {
    console.log(`Valid image URI. Dimensions: ${width}x${height}`);
  }, 
  (error) => {
    console.log(`Invalid image URI: ${image}`);
    Alert.alert('Image Error', 'The selected image cannot be loaded.');
  }
);

    console.log('Using URI for upload:', image);
console.log('Platform:', Platform.OS);

    console.log("Image object:", image);

  //   let filename = image.split('/').pop();
  // let match = /\.(\w+)$/.exec(filename || '');
  // let type = match ? `image/${match[1]}` : `image`; Platform.OS === 'ios' ? image.replace('file://', '') : 


  fullData.append('image', {
    uri: image,
    name: 'profileImage.jpg',
    type: 'image/jpg',
  });

  
  }
if (!userId || userId === 'null') {
  Alert.alert('Error', 'User ID is missing. Please log in again.');
  return;
}


  Object.entries({
    ...form,
    userId,
    homeaddress: homeAddress,
    residentaddress: residentAddress,
    stateOrigin,
    lgaOrigin,
    stateResident,
    lgaResident,
    maritalStatus,
    children: children ? 1 : 0,
    siblings: siblings ? 1 : 0,
    parents: parents ? 1 : 0,
  }).forEach(([key, value]) => {
    fullData.append(key, value?.toString() || '');
  });
  
  fullData.append('userId', userId);

  try {
    const response = await API.post('/personal-details', fullData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
   
      }
    });


    if (response.status === 201) {
      const { next, userId, remainingSteps } = response.data;
      await AsyncStorage.setItem('userId', userId.toString());
      await AsyncStorage.setItem('nextSteps', JSON.stringify(next));
      await AsyncStorage.setItem('remainingSteps', JSON.stringify(remainingSteps));
      console.log('user Id:', userId);
      Alert.alert('Success', 'Registration successful!');
      await handleNextStep('personal-details', response.data);
    } else {
      Alert.alert('Error', 'Registration failed.');
    }
  } catch (error: any) {
  console.error('Network Error Details:', error.toJSON?.() || error);

  const backendMessage =
    error.response?.data?.errors?.image?.[0] ||
    error.response?.data?.message ||
    error.message ||
    'Something went wrong';

  Alert.alert('Error', backendMessage);
}
};


  return (
       <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#121212' }}
      >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Registration Page 2</Text>

 

 <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 15, height: 50, justifyContent: 'center' }}>
        <Picker
          selectedValue={maritalStatus}   onValueChange={setMaritalStatus}    style={styles.picker}    >
          <Picker.Item label="Select Marital status" value="" />
          {relationship.map((item) => (
            <Picker.Item key={item.id} value={item.id} label={item.name} />
          ))}
        </Picker>
      </View>





      <TextInput
        placeholder="Home Address"
        value={homeAddress}
        onChangeText={setHomeAddress}
        style={styles.input}
      />

      <Picker selectedValue={stateOrigin} onValueChange={setStateOrigin} style={styles.picker}>
        <Picker.Item label="State of Origin" value="" />
        {states.map((state) => (
          <Picker.Item key={state.id} label={state.name} value={state.id} />
        ))}
      </Picker>

      <Picker selectedValue={lgaOrigin} onValueChange={setLgaOrigin} style={styles.picker}>
        <Picker.Item label="LGA of Origin" value="" />
        {lgas.map((lga) => (
          <Picker.Item key={lga.id} label={lga.name} value={lga.id} />
        ))}
      </Picker>

      <TextInput
        placeholder="Resident Address"
        value={residentAddress}
        onChangeText={setResidentAddress}
        style={styles.input}
      />

      <Picker selectedValue={stateResident} onValueChange={setStateResident} style={styles.picker}>
        <Picker.Item label="State of Residence" value="" />
        {states.map((state) => (
          <Picker.Item key={state.id} label={state.name} value={state.id} />
        ))}
      </Picker>

      <Picker selectedValue={lgaResident} onValueChange={setLgaResident} style={styles.picker}>
        <Picker.Item label="LGA of Residence" value="" />
        {lgasResidentList.map((lga) => (
          <Picker.Item key={lga.id} label={lga.name} value={lga.id} />
        ))}
      </Picker>

      <View style={styles.checkboxRow}>
<TouchableOpacity
  style={styles.checkboxRow}
  onPress={() => setChildren(prev => !prev)}
>
  <Switch value={children} onValueChange={setChildren} />
  <Text style={styles.label}>I have child/children</Text>
</TouchableOpacity>


        {/* <Switch value={children} onValueChange={setChildren} />
        <Text style={styles.label}>I have child/children</Text> */}
      </View>

      <View style={styles.checkboxRow}>

        <TouchableOpacity
  style={styles.checkboxRow}
  onPress={() => setSiblings(prev => !prev)}
>
  <Switch value={siblings} onValueChange={setSiblings} />
  <Text style={styles.label}>I have siblings</Text>
</TouchableOpacity>

        {/* <Switch value={siblings} onValueChange={setSiblings} />
        <Text style={styles.label}>I have siblings</Text> */}
      </View>

      <View style={styles.checkboxRow}>

        <TouchableOpacity
  style={styles.checkboxRow}
  onPress={() => setParents(prev => !prev)}
>
  <Switch value={parents} onValueChange={setParents} />
  <Text style={styles.label}>I have siblings</Text>
</TouchableOpacity>
        {/* <Switch value={parents} onValueChange={setParents} />
        <Text style={styles.label}>My parents are alive</Text> */}
      </View>

       {/* <Button title="📷 Take Photo" onPress={takePhoto} />
<Button title="🖼️ Pick Image from Gallery" onPress={pickImage} />
<Button title="🎥 Record Video" onPress={recordVideo} />
<Button title="📂 Pick Video from Gallery" onPress={pickVideo} /> */}


{/* {renderMediaPreview()} */}


<View>
 <Button title="Pick an image from gallery" onPress={pickImageFromGallery} />
      <View style={{ height: 10 }} />
      <Button title="Take a photo with camera" onPress={takePhotoWithCamera} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
</View>

   <View style={{ height: 10 }} />
      <Button title="Register" onPress={handleRegister} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  scrollContainer: {
  padding: 20,
  borderColor: 'red',
  borderWidth: 1,
  backgroundColor: '#121212',
},
  container: { padding: 20, backgroundColor: '#121212', },
  input: {  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#aaa',
  padding: 12,
  borderRadius: 8,
  backgroundColor: '#121212',
  color: 'white' 
},
  picker: { marginBottom: 15 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { marginLeft: 8,
    backgroundColor: '#121212',
    color: 'white'
  },
  title: { fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white', },

     preview: {
    width: '100%',
    height: 250,
    marginTop: 15,
    borderRadius: 10,
  },

  image: {
    width: 200,
    height: 200,
  },
});
