import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router';

const Home = () => {
  return (
    <View>
      <Text>home</Text>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})



// {
//   "cli": {
//     "version": ">= 14.10.1",
//     "appVersionSource": "remote"
//   },
//   "build": {
//     "development": {
//       "developmentClient": true,
//       "distribution": "internal",
//       "channel": "development"
//     },
//     "preview": {
//       "distribution": "internal",
//       "channel": "preview",
//       "android": {
//     "buildType": "apk"
//   }
//     },
//     "production": {
//       "autoIncrement": true,
//       "channel": "production"
//     }
//   },
//   "submit": {
//     "production": {}
//   }
// }