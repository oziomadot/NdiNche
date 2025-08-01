import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const CheckStatus = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you in distress?</Text>
      <View style={styles.button}>
      <Button  title="Yes, send help!" onPress={() => router.replace('/send-location')} />
        </View>
        <View style={styles.button}>
        <Button  title="No, I'm safe" onPress={() => {}} />
                  </View>
    </View>
  )
}

export default CheckStatus

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: { fontSize: 22, marginBottom: 20},
  button: { marginBottom: 20 }
});