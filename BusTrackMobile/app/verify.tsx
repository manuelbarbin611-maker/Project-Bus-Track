import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = () => {
    const fullCode = code.join('');

    if (fullCode === '123456') {
      setError(false);
      setSuccess(true);
      setTimeout(() => router.replace('/explore'), 1500);
    } else {
      setSuccess(false);
      setError(true);
    }
  };

  const handleResend = () => {
    setSuccess(true);
    setError(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login')}>
          <Ionicons name="arrow-back" size={20} color="#94a3b8" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code we sent to your email.</Text>

        {success && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.successText}>Verification code sent.</Text>
          </View>
        )}

        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={[styles.box, error && styles.boxError]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => {
                const newCode = [...code];
                newCode[index] = text;
                setCode(newCode);
                if (error) setError(false);
              }}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>The code is invalid or expired.</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={handleVerify}>
          <Text style={styles.primaryButtonText}>Verify email</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.linkText}>Resend code</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.logoutText}>Go back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06070c', paddingHorizontal: 24, paddingTop: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#94a3b8', fontSize: 16 },
  hero: { backgroundColor: '#0f172a', borderRadius: 24, padding: 24, flex: 1, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 12, lineHeight: 40 },
  subtitle: { color: '#94a3b8', textAlign: 'center', fontSize: 16, marginBottom: 24, lineHeight: 24 },
  successBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f2f1f', borderWidth: 1, borderColor: '#16a34a', padding: 14, borderRadius: 16, marginBottom: 16 },
  successText: { color: '#86efac', marginLeft: 10, fontSize: 14 },
  errorText: { color: '#fca5a5', textAlign: 'center', marginBottom: 12, fontSize: 14 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  box: { width: 48, height: 56, borderWidth: 1, borderColor: '#334155', borderRadius: 16, textAlign: 'center', fontSize: 20, color: '#fff', backgroundColor: '#020617' },
  boxError: { borderColor: '#f87171', backgroundColor: '#1f1b24' },
  primaryButton: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  linkText: { color: '#818cf8', fontWeight: '700' },
  logoutText: { color: '#94a3b8' },
});
