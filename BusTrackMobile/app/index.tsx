import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient 
      colors={['#110c26', '#080b11', '#01140f']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#110c26" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.brand}>ProjectBustracking</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topGetStarted} onPress={() => router.push('/register')}>
              <Text style={styles.topGetStartedText}>Get started</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Body Content */}
        <View style={styles.content}>
          
          <Text style={styles.titleText}>Track every passenger,</Text>
          
          {/* SVG Container - Naayos na ang tags para walang TypeScript error */}
          <View style={styles.svgWrapper}>
            <Svg height="55" width="100%" viewBox="0 0 380 55">
              <Defs>
                <SvgGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#a855f7" />
                  <Stop offset="50%" stopColor="#6366f1" />
                  <Stop offset="100%" stopColor="#2dd4bf" />
                </SvgGradient>
              </Defs>
              <SvgText
                fill="url(#textGrad)"
                fontSize="34"
                fontWeight="800"
                x="190"
                y="40"
                textAnchor="middle"
              >
                every step of the way
              </SvgText>
            </Svg>
          </View>

          <Text style={styles.subtitle}>
            Manage passenger records • Real-time boarding status • Powerful search & filtering
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => router.push('/register')}
            >
              <Text style={styles.primaryButtonText}>Start managing passengers  ➔</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => router.push('/login')}
            >
              <Text style={styles.secondaryButtonText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { 
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16,
  },
  brand: { color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  loginLink: { color: '#94a3b8', fontSize: 15, fontWeight: '500' },
  topGetStarted: { backgroundColor: '#6366f1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  topGetStartedText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, alignItems: 'center' },
  
  titleText: { 
    color: '#ffffff', 
    fontSize: 34, 
    fontWeight: '800', 
    textAlign: 'center', 
    lineHeight: 44, 
    letterSpacing: -0.5,
  },
  svgWrapper: {
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  subtitle: { 
    color: '#94a3b8', 
    fontSize: 15, 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 40,
    paddingHorizontal: 10
  },
  buttonContainer: { width: '100%', gap: 12 },
  primaryButton: { 
    backgroundColor: '#6366f1', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center'
  },
  secondaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
