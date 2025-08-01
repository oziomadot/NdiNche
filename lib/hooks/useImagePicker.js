import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type MediaType = 'image' | 'video';

export const useImagePicker = () => {
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [mediaAsset, setMediaAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);


 const handleMediaSelection = async (
  type: MediaType,
  launchFn: typeof ImagePicker.launchCameraAsync | typeof ImagePicker.launchImageLibraryAsync,
  permissionFn: () => Promise<{ status: string }>,
  options: Partial<ImagePicker.ImagePickerOptions> = {}
) => {
    const { status } = await permissionFn();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant access in your device settings.');
      return;
    }

    setLoading(true);
setError(null);
let result: ImagePicker.ImagePickerResult;

try {
  result = await launchFn({
    mediaTypes: type === 'image'
      ? ImagePicker.MediaTypeOptions.Images
      : ImagePicker.MediaTypeOptions.Videos,
    quality: 1,
    allowsEditing: true,
    aspect: [4, 3],
    ...options,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const asset = result.assets[0];
    setMediaUri(asset.uri);
    setMediaAsset(asset);
    setMediaType(type);
  } else {
    // Just to be safe, clear out the media state
    clearMedia();
  }
} catch (err) {
  setError(err.message ?? 'Something went wrong');


} finally {
  setLoading(false);

}
  };

  const pickMedia = (type: MediaType) =>
    handleMediaSelection(
      type,
      ImagePicker.launchImageLibraryAsync,
      ImagePicker.requestMediaLibraryPermissionsAsync
    );

  const takePhotoOrVideo = (type: MediaType) =>
    handleMediaSelection(
      type,
      ImagePicker.launchCameraAsync,
      ImagePicker.requestCameraPermissionsAsync
    );

    

// const pickImage = async () => {
//   let result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     allowsEditing: true,
//     quality: 1,
//   });

//   if (!result.canceled) {
//     setMediaUri(result.assets[0].uri);
//   } else {
//     setMediaUri(null); // NOT "unknown"
//   }
// };


  return {
  mediaUri,
  mediaType,
  mediaAsset,
  pickImage: () => pickMedia('image'),
  pickVideo: () => pickMedia('video'),
  takePhoto: () => takePhotoOrVideo('image'),
  recordVideo: () => takePhotoOrVideo('video'),
  clearMedia: () => {
    setMediaUri(null);
    setMediaType(null);
    setMediaAsset(null);
  },
  loading,
  error,
};

};
