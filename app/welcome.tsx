import { View, Text, StyleSheet, Button, ActivityIndicator, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { startRegistration } from '../lib/regNav';
import Checkbox from 'expo-checkbox'; // ✅ install if not already

export default function Welcome() {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const openTerms = () => {
    Linking.openURL('https://www.ndinchesecurity.com/termsandconditions');
  };

  const handleContinue = async () => {
    setLoading(true);
    await startRegistration();
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to NdiNche Security App</Text>

      <Text style={styles.noteTitle}>NB:</Text>
      <Text style={styles.note}>
        NdiNche is a private security agency.{"\n\n"}
        Registration in this app takes time because this is a matter of life and death.{"\n"}
        We collect detailed information to deliver effective and reliable rescue services.{"\n\n"}
        Our rescue operations are expected to take place within the first 24 hours of an alert.
      </Text>

      <Text style={styles.thankYou}>
        Thank you for choosing NdiNche Security as your safety partner.
      </Text>

      <View style={styles.checkboxContainer}>
        <Checkbox value={agreed} onValueChange={setAgreed} color={agreed ? '#00FFAA' : undefined} />
        <TouchableOpacity onPress={openTerms}>
          <Text style={styles.link}>I agree to the Terms and Conditions</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <View style={{ marginTop: 30 }}>
          <Button title="Continue" onPress={handleContinue} disabled={!agreed} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#121212',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 18,
    color: '#FFCC00',
    marginBottom: 10,
    fontWeight: '600',
  },
  note: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  thankYou: {
    fontSize: 16,
    color: '#00FFAA',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  link: {
    fontSize: 16,
    color: '#3399FF',
    textDecorationLine: 'underline',
  },
});
