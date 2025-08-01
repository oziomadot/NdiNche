import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import API from '../lib/api';

const Practice = () => {
  const [practiceCount, setPracticeCount] = useState(3);
  const [isDistress, setIsDistress] = useState(false);
  const [isRescued, setIsRescued] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [userId, setUserId] = useState();
  const [instruction, setInstruction] = useState('Go to your app gallery and select the NdiNche app.');
   const [step, setStep] = useState<'start' | 'selectedApp' | 'confirmedDistress' | 'rescued' | 'complete'>('start');

  useEffect(() => {
    const loadUserAndToken = async () => {
      const id = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setUserId(id);
    };
    loadUserAndToken();
  }, []);


  const updateInstruction = (newStep: typeof step) => {
    switch (newStep) {
      case 'start':
        return 'Go to your app gallery and select the NdiNche app.';
      case 'selectedApp':
        return 'You’ve opened the app. Confirm that you’re in distress.';
      case 'confirmedDistress':
        return 'Sending your location... Stay calm and keep your phone close.';
      case 'rescued':
        return 'Rescue successful! You may repeat the practice or proceed.';
      case 'complete':
        return 'Practice complete! Finalizing...';
      default:
        return '';
    }
  };

  const simulateRescue = () => {
    setInstruction('You’ve opened the app. Confirm that you are in distress.');
    Alert.alert("Are you in distress?", "", [
      {
        text: "Yes",
        onPress: () => {
          
          setStep('confirmedDistress');
          setInstruction(updateInstruction('confirmedDistress'));
          
          setTimeout(() => {
            Alert.alert(
              "Your location is being sent to our rescue team",
              "Keep your phone as close as possible. You will be rescued in less than 24hrs. Do everything possible to stay alive."
            );
            setTimeout(() => {
              setIsRescued(true);
              setShowFinal(true);
              setInstruction('🎉 Congratulations! You have been rescued.');
              Alert.alert("Congratulations", "You have been rescued 🎉");
            }, 3000);
          }, 1000);
        }
      }
    ]);
  };

  const handleClickApp = () => {
    if (practiceCount > 0) {
     setPracticeCount(practiceCount - 1);
      setStep('selectedApp');
      setInstruction(updateInstruction('selectedApp'));
      simulateRescue();
    } else {
      Alert.alert("Limit reached", "You have used all your practice attempts.");
    }
  };

  const handlePracticeComplete = async () => {
    console.log('handlePracticeComplete called');
    if (!userId) return;
    setStep('complete');
    setInstruction(updateInstruction('complete'));
    console.log('userId is', userId);

    await AsyncStorage.setItem('Practice', 'true');

    try {
      const response = await API.post(`/practice-complete/${userId}`);
      if(response.status === 200){
      
        const { token } = response.data;

  // ✅ Store token
  await AsyncStorage.setItem('auth_token', token);


console.log('token is', token);

  // // ✅ Set default auth header for future requests
  // API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      Alert.alert(
        "Congratulations",
        "You have completed the whole steps. For more information, check your email and/or visit our website.",
        [
          {
            text: "Done",
            onPress: () => BackHandler.exitApp()
          }
        ]
      );
    }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Simulation</Text>
      <Text style={styles.instruction}>📝 {instruction}</Text>
      <Text style={styles.countText}>You have {practiceCount} practice attempt(s) left</Text>

      {!isDistress && !isRescued && (
        <TouchableOpacity onPress={handleClickApp} style={styles.appIcon}>
          <Text style={styles.appText}>📱 NdiNche</Text>
        </TouchableOpacity>
      )}

      {isRescued && showFinal && (
        <View style={{ marginTop: 20 }}>
          {practiceCount > 0 && (
            <Button title="🔁 Repeat Practice" onPress={handleClickApp} />
          )}
          <Button title="✅ I Have Practiced" onPress={handlePracticeComplete} />
        </View>
      )}
    </View>
  );
};

export default Practice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  instruction: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#333'
  },
  countText: {
    fontSize: 14,
    marginBottom: 20
  },
  appIcon: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20
  },
  appText: {
    color: '#fff',
    fontSize: 18
  }
});
