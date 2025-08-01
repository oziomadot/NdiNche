import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraType, CameraView, useCameraPermissions, Camera } from 'expo-camera';
// import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { manipulateAsync } from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video } from 'react-native-compressor';




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
  const [userId, setUserId] = useState();
  const [thumbnailImage, setThumbnailImage] =useState(null);
  const [uploadButton, setUploadButton] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const cameraRef = useRef<CameraView>(null);


 // Fetch Marital Status when resident state changes
 useEffect(() => {
    try{
    API.get(`/id-cards/${userId}`)
      .then((res) => {

        setUserImage(res.data.pix);

        console.log('User Image is: ' + res.data.pix);
      })
      .catch((err) => Alert.alert('Error', 'Failed to load user'));
    }catch($e){

    }
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


  const generateThumbnail = async (videoUri) => {
    try{
      console.log('createing thumbnail');
  const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
    time: 1000, // 1 second into video
  });
setThumbnailImage(uri);



console.log("Thumbnail created:", uri);

  return uri;

  } catch (e) {
   console.warn(e);
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
  const url = `https://5fbb849de4e2.ngrok-free.app/storage/${sanitized}`;
  //  const url = `https://a9a38ac767d4.ngrok-free.app/storage/${userImage}`;
  const dest = FileSystem.documentDirectory + 'user-id.jpg';

  try {
    const { uri } = await FileSystem.downloadAsync(url, dest);
    const info = await FileSystem.getInfoAsync(uri);
    console.log('✅ Downloaded user image to:', uri, 'Size:', info.size);

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
    // Only proceed when both images are ready
    if (!thumbnailImage || !userImage) {
      console.log('waiting for thumbnailImage & userImage…');
      return;
    }

    const doFaceCompare = async () => {
      setVerifying(true);


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

      console.log('Full User Image URI:', fullImageUri);

      // 2) Build FormData
      const formData = new FormData();
      formData.append('api_key', 'snSEh7PiHU3gWvuQogsiVaYVPNjSRAmO');
      formData.append('api_secret', 'fJNalM3HHIPw02F4GaFcW6h9BDfqNOV_');
      formData.append('image_file1', {
        uri: thumbnailImage,
        name: 'thumbnailImage.jpg',
        type: 'image/jpeg',
      });

      // formData.append('image_base64_2', fullBase64);
      formData.append('image_file2', {
        uri: fullImageUri,
        name: 'id.jpg',
        type: 'image/jpeg',
      });

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
      console.warn('Camera not ready');
      return;
    }

    try {

      const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
if (micStatus !== 'granted') {
  Alert.alert('Microphone permission is required to record video');
  return;
}



      setRecording(true);
      const video = await cameraRef.current.recordAsync({
         maxDuration: 10, // record max 10 seconds video
        quality: '720p',
    });

      if (video?.uri) {
        console.log('Video recorded at:', video.uri);
        setVideoUri(video.uri);
        generateThumbnail(video.uri);
        
        Alert.alert('Recording finished');
      } else {
        Alert.alert('Recording failed: No URI');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Recording Error', err.message);
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




const info1 = await FileSystem.getInfoAsync(videoUri);

    console.log("Video size before compress:", info1.size);

console.log('About to compress: Lets wait ');

const result = await Video.compress(
  videoUri,
  {
    compressionMethod: 'auto',
    progressDivider: 10,
    downloadProgress: (progress) => {
      console.log('downloadProgress: ', progress);
    },
  },
  (progress) => {
    console.log('Compression Progress: ', progress);
  }
);


console.log("Compressed video URI:", result);


    const info = await FileSystem.getInfoAsync(result);

    console.log("Video size before upload:", info.size);

    const formData = new FormData();
    const userId = await AsyncStorage.getItem('userId');
    setUserId(userId);

    formData.append('result', {
      uri: result,
      name: 'video.mp4',
      type: 'video/mp4',
    });
    // formData.append('user_id', userId);

    try {
      const response = await API.post(`/update-id/${userId}`, formData, {
        headers: {  'Content-Type': 'multipart/form-data',
        Accept: 'application/json', },
      });

      console.log('This is the response', response.data);
        console.log('This is the response', response);
      if (response.data.success) {
        Alert.alert('Verification Process completed');
     
        await AsyncStorage.setItem('userId', userId.toString());
        
      
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
