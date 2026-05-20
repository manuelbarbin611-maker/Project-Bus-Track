import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <LinearGradient 
      colors={['#0f172a', '#020617']} // Premium sleek dark mode gradient
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>🠔 Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>

          {/* Form Fields */}
          <View style={styles.card}>
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>Join the fleet management platform</Text>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full name</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Juan dela Cruz" 
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email address</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="you@example.com" 
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Min. 8 characters" 
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Repeat password" 
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Create account</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.footerText}>
                  Already have an account? <Text style={styles.linkText}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  backButton: { paddingHorizontal: 20, paddingVertical: 16 },
  backText: { color: '#94a3b8', fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { color: '#1e293b', fontSize: 34, fontWeight: '800', textAlign: 'center', marginBottom: 12, lineHeight: 42 },
  subtitle: { color: '#64748b', fontSize: 16, textAlign: 'center', marginBottom: 36 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { color: '#1e293b', fontSize: 14, fontWeight: '600' },
  input: { 
    backgroundColor: '#f1f5f9', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 10, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    color: '#1e293b',
    fontSize: 15
    },
    submitButton: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    footerText: { color: '#64748b', fontSize: 14, textAlign: 'center', marginTop: 8 },
  linkText: { color: '#2563eb', fontSize: 14, fontWeight: '700' }

    ,
    card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 }
});
