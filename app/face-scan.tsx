import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraType, CameraView, useCameraPermissions, Camera } from 'expo-camera';
// import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImageManipulator from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImagePicker from 'expo-image-picker';
// import { Video } from 'react-native-compressor';
// Removed react-native-compressor import - using Expo alternatives instead




import API from '../lib/api';
import { handleNextStep } from '../lib/regNav';


export default function FaceScan({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [userImage, setUserImage] = useState();
  const [userId, setUserId] = useState('');
  const [thumbnailImage, setThumbnailImage] =useState(null);
  const [uploadButton, setUploadButton] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const cameraRef = useRef<CameraView>(null);




useEffect(() => {
  let isMounted = true;

  const load = async () => {
    try {
      console.log('🔍 Loading userId from AsyncStorage...');
      const storedId = await AsyncStorage.getItem('userId');
      console.log('📱 Retrieved userId:', storedId);
      
      if (!storedId || storedId === 'null') {
        console.log('❌ No valid userId found in AsyncStorage');
        Alert.alert('Error', 'User ID not found. Please complete registration first.');
        return;
      }

      if (!isMounted) return;
      setUserId(storedId);
      console.log('✅ userId set to state:', storedId);

      console.log('🌐 Fetching user image from API...');
      const res = await API.get(`/id-cards/${storedId}`);
      if (!isMounted) return;
      
      console.log('📸 API response:', res.data);
      setUserImage(res.data?.pix ?? null);
      console.log('✅ userImage set to:', res.data?.pix);
    } catch (e) {
      console.error('❌ Error loading user data:', e);
      Alert.alert('Error', `Failed to load user: ${e.message}`);
    }
  };

  load();
  return () => { isMounted = false; };
}, []);

    

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startRecordingWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };


  const generateThumbnail = async (videoUri: string) => {
    try {
      console.log('creating thumbnail...');
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000, // 1 second into video
      });
  
      setThumbnailImage(uri);
      console.log("Thumbnail created:", uri);
     
      Alert.alert('Thumbnail created'); // <-- after setThumbnailImage
      return uri;
    } catch (e) {
      console.warn('Thumbnail creation failed', e);
    }
  };
  






const checkDownload = async (localUri) => {
  // Get basic info (size, exists)
  const info = await FileSystem.getInfoAsync(localUri);
  console.log('Downloaded file info by checkdowload:', info);  
  // Try reading a snippet of bytes as Base64
  const snippet = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
    position: 0,
    length: 30,            // first 30 bytes
  });
  console.log('First 30 base64 chars:', snippet);
};


const downloadUserImage = async (userImage) => {
  if (!userImage || typeof userImage !== 'string') {
    console.error('downloadUserImage: invalid userImage', userImage);
    return null;
  }

  console.log(`I have the:`, userImage);

  const sanitized = userImage.replace('public/', '');
  const url = `https://90c0ccb06bfd.ngrok-free.app/storage/${sanitized}`;

  //  const url = `https://a9a38ac767d4.ngrok-free.app/storage/${userImage}`;
  const dest = FileSystem.documentDirectory + 'user-id.jpg';

  try {
    const { uri } = await FileSystem.downloadAsync(url, dest);
    const info = await FileSystem.getInfoAsync(uri);
    console.log('✅ Downloaded user image to:', uri);

    // checkDownload(url);

    if (!info.exists || info.size === 0) {
      console.error('Downloaded file is empty or invalid');
      return null;
    }
    return uri;
  } catch (err) {
    console.error('❌ downloadUserImage failed', err);
    return null;
  }
};


useEffect(() => {
    

  const doFaceCompare = async () => {
    console.log('🔍 doFaceCompare called');
    console.log('📱 userId:', userId);
    console.log('🖼️ thumbnailImage:', thumbnailImage);
    console.log('🆔 userImage:', userImage);

// Only proceed when both images are ready
if (!thumbnailImage || !userImage) {
  console.log('⏳ waiting for thumbnailImage & userImage…');
  return;
}
      // 1) Download the full ID image and get a file:// URI
      const fullImageUri = await downloadUserImage(userImage);
      if (!fullImageUri) {
        Alert.alert('Error', 'Could not download ID image.');
        setVerifying(false);
        return;
      }
      
      checkDownload(fullImageUri);

      const fullBase64 = await FileSystem.readAsStringAsync(fullImageUri, {
  encoding: FileSystem.EncodingType.Base64,
});


// Assume base64Image is your base64 string (without the data URI prefix)
// const manipulated = await ImageManipulator.manipulateAsync(
//   fullImageUri,
//   [{ resize: { width: 800 } }],
//   { format: ImageManipulator.SaveFormat.JPEG, compress: 0.9, base64: true }
// );

//       console.log('Full User Image URI:', manipulated);
//       console.log("Manipulated file:", manipulated.uri);
console.log("Base64 starts:");

      // 2) Build FormData
      const formData = new FormData();
      formData.append('api_key', 'snSEh7PiHU3gWvuQogsiVaYVPNjSRAmO');
      formData.append('api_secret', 'fJNalM3HHIPw02F4GaFcW6h9BDfqNOV_');

      //send ThumbnailImage as file
      formData.append('image_file1', {
        uri: thumbnailImage,
        name: 'thumbnailImage.jpg',
        type: 'image/jpeg',
      } as any);

      formData.append('image_base64_2', fullBase64);
      // formData.append('image_file2', {
      //   uri: fullImageUri,
      //   name: 'id.jpg',
      //   type: 'image/jpeg',
      // } as any);

      // formData.append('image_base64_2', fullBase64);

      setVerifying(true);

      // 3) Call the Face++ compare API
      try {
        const res = await fetch(
          'https://api-us.faceplusplus.com/facepp/v3/compare',
          { method: 'POST', body: formData }
        );
        const json = await res.json();
        console.log('Face++ result:', json);

        if (json.confidence > 80) {
          Alert.alert('Success', 'Face verified! Click Next');
          setUploadButton(true);
        } else {
          Alert.alert('Failed', 'Face does not match ID. Please record again.');
        }
      } catch (err) {
        console.error('Compare request failed', err);
        Alert.alert('Error', 'Something went wrong while verifying.');
      } finally {
        setVerifying(false);
      }
    };

    doFaceCompare();
  }, [thumbnailImage, userImage]);






const startRecording = async () => {
  if (!cameraRef.current || !isCameraReady) {
    console.warn("Camera not ready");
    return;
  }

  try {
    const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
    if (micStatus !== "granted") {
      Alert.alert("Microphone permission is required to record video");
      return;
    }

    setRecording(true);

    const video = await cameraRef.current.recordAsync({
      maxDuration: 10, // limit duration
      // maxFileSize: 90000, // reduce resolution
      maxFileSize: 9 * 1024 * 1024,
   
    });

    if (video?.uri) {
      console.log("Video recorded at:", video.uri);
      setVideoUri(video.uri);
      generateThumbnail(video.uri);
      Alert.alert("Recording finished");
    } else {
      Alert.alert("Recording failed: No URI");
    }
  } catch (err) {
    console.error(err);
    Alert.alert("Recording Error", err.message);
  } finally {
    setRecording(false);
  }
};

  // compare face and ID

  

  const stopRecording = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
    }
  };

  const uploadVideo = async () => {
    if (!videoUri) return Alert.alert('No video to upload');

    try {
      const info1 = await FileSystem.getInfoAsync(videoUri);
      console.log("Video size before processing:", info1);

      // For now, we'll use the original video without compression
      // const compressedUri = await Video.compress(videoUri, {
      //   compressionMethod: 'auto', // or 'manual'
      //   minimumFileSizeForCompress: 5, // in MB
      // });


      // const videoNew = await FileSystem.getInfoAsync(compressedUri);

      // console.log("New video size is: ", videoNew)
      // In a production app, you might want to implement server-side compression
      // or use a different approach for video optimization
      const videoFile = {
        uri: videoUri,
        name: 'video.mp4',
        type: 'video/mp4',
      };

      const formData = new FormData();
      formData.append('result', videoFile as any);

      console.log("Uploading video file:", videoFile);

      const response = await API.post(`/update-id/${userId}`, formData, {
        headers: {  
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json', 
        },
      });

      console.log('This is the response', response.data);
       
      if (response.data.success) {
        Alert.alert('Verification Process completed');
        handleNextStep('face-scan', response.data);
      } else {
        Alert.alert('Failed', response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Upload Error', 'Failed to upload video');
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {verifying && (
  <View style={{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99
  }}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={{ color: '#fff', marginTop: 10 }}>Please wait, verifying your face...</Text>
  </View>
)}
      <CameraView
      mode="video"
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={toggleCameraFacing} style={styles.button}>
          <Text style={styles.text}>Flip</Text>
        </TouchableOpacity>

        {!recording ? (
          countdown > 0 ? (
            <Text style={styles.countdown}>{countdown}</Text>
          ) : (
            <TouchableOpacity onPress={startRecordingWithCountdown} style={styles.button}>
              <Text style={styles.text}>Record</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity onPress={stopRecording} style={styles.button}>
            <Text style={[styles.text, { color: 'red' }]}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {uploadButton && (
        <TouchableOpacity onPress={uploadVideo} style={[styles.button, { marginTop: 20 }]}>
          <Text style={styles.text}>Next</Text>
        </TouchableOpacity>
      )}

      <View style={{height:80}}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  message: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 15,
    backgroundColor: '#000',
    
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdown: {
    fontSize: 48,
    color: 'white',
    textAlign: 'center',
  },
});
