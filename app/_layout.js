// app/_layout.js
import { Slot } from 'expo-router';
import { RegisterProvider } from '../context/RegisterContext'; // adjust the path to where your context is
import { View } from 'react-native';

import { LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: ['ndinche://'],
  config: {
    screens: {
      'verify-phone': 'verify',
      // add more routes if needed
    },
  },
};


export default function Layout() {

   console.log('Layout is rendering');
    return (
       
     
    <RegisterProvider>
    <SafeAreaProvider>
          <Slot />
       </SafeAreaProvider>
    </RegisterProvider>
  );
}


