import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEventListener } from 'expo';
const HowItWorks = () => {
  const videoRef = useRef(null);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [showUnderstandButton, setShowUnderstandButton] = useState(false);

  const videoSource = require('../assets/ACallToDuty.mp4');

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.play();
  });

   useEventListener(player, 'playToEnd', () => {
     setHasPlayedOnce(true);
            setShowUnderstandButton(true);
    console.log('Video has ended');
  });
  useEffect(() => {
    Alert.alert(
      'Congratulations!',
      'You have completed your registration. It is time to watch this video to understand how this app works.'
    );
  }, []);

  const handleReplay = () => {
    player.replay();
  };

  const handleIUnderstand = async () => {
    await AsyncStorage.setItem('i_understood', 'true');
    Alert.alert('Good!', 'It is now time to practice how to use this app.', [
      {
        text: 'OK',
        onPress: () => router.replace('/practice'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How it works</Text>

      <VideoView
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        
        
        nativeControls
        style={styles.video}
        
      />

      <View style={styles.buttons}>
        <Button title="Replay Video" onPress={handleReplay} />
        {showUnderstandButton && (
          <View style={{ marginTop: 20 }}>
            <Button title="I Understand Now" onPress={handleIUnderstand} color="green" />
          </View>
        )}
      </View>
    </View>
  );
};

export default HowItWorks;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  video: {
    width: '100%',
    height: 250,
    backgroundColor: 'black',
    marginBottom: 20,
  },
  buttons: {
    alignItems: 'center',
  },
});
