import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Store, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('scout@saanmura.ph');
  const [password, setPassword] = useState('ScoutPass123!');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoBadge}>
            <Store size={26} color="#8F4E00" />
          </View>
          <Text style={styles.title}>SaanMura Mobile</Text>
          <Text style={styles.subtitle}>Citizen Price Scout & Palengke Watch</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={16} color="#877365" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={16} color="#877365" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} color="#877365" /> : <Eye size={16} color="#877365" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.submitBtn}
              onPress={handleLogin}
              activeOpacity={0.88}
            >
              <Text style={styles.submitBtnText}>Sign In as Contributor</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerLink}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.registerLinkText}>
                New citizen scout? <Text style={{ color: '#8F4E00', fontWeight: 'bold' }}>Register here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFDCC2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8F4E00',
  },
  subtitle: {
    fontSize: 11,
    color: '#544437',
    marginTop: 2,
    marginBottom: 20,
  },
  form: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#111C2D',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF9F43',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  registerLinkText: {
    fontSize: 11,
    color: '#544437',
  },
});
