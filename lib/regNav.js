// utils/nextStep.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import API from './api';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';




export const startRegistration = async () => {
  await AsyncStorage.setItem('next', '/register');
  await AsyncStorage.setItem('registrationCompleted', 'false');
  await AsyncStorage.setItem('Iunderstood', 'false');
  await AsyncStorage.setItem('Practice', 'false');
  router.replace('/register');
};



   const safeSet = async (key, value) => {
  if (value !== undefined && value !== null) {
    await AsyncStorage.setItem(key, String(value));
  } else {
    await AsyncStorage.removeItem(key);
  }
};

export const handleNextStep = async (currentStep, responseData) => {
  try {
    const data = responseData;
    if (!data) throw new Error('Missing response data');

    const { next, registrationComplete, userId, userEmail, userPhonenumber, i_understood, Practice } = data;

    console.log('👉 Handling next step:', {
  next,
  registrationComplete,
  userId,
  userEmail,
  userPhonenumber,
  i_understood,
  Practice  
});

    if (next) await AsyncStorage.setItem('next', next);
    await safeSet('registrationCompleted', registrationComplete);
    await safeSet('userId', userId);
    await safeSet('userEmail', userEmail);
    await safeSet('userPhonenumber', userPhonenumber);
    await safeSet('Iunderstood', i_understood);
    await safeSet('Practice', Practice);

    router.replace(next);
  } catch (error) {
    console.error('Error in handleNextStep:', error);
  }
  
};
