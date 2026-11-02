import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Image, Platform, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Shield, CheckCircle, Camera, RotateCcw, 
  User, CreditCard, Star, Lock, Eye, EyeOff 
} from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [legalName, setLegalName] = useState('Juan Dela Cruz');
  const [email, setEmail] = useState('scout@saanmura.ph');
  const [mobile, setMobile] = useState('917 842 5501');
  const [philsysId, setPhilsysId] = useState('3819 - 8402 - 1109 - 7721');
  const [password, setPassword] = useState('ScoutPass123!');
  const [confirmPassword, setConfirmPassword] = useState('ScoutPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'tier_1' | 'tier_2'>('tier_2');
  const [isBiometricDone, setIsBiometricDone] = useState(true);

  const handleRegister = () => {
    if (!legalName || !email || !password) {
      alert('Please fill in all mandatory fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    Alert.alert(
      'Accreditation Registered! 🇵🇭',
      `Welcome to SaanMura, ${legalName}! Your Contributor Tier-2 account has been created with PhilSys verification.`,
      [
        {
          text: 'Open Home Catalog',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header matching mockup */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#111C2D" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Contributor Registration</Text>
            <Text style={styles.headerSubtitle}>Republic Act 7581 Price Monitored</Text>
          </View>
          <View style={styles.dtiBadge}>
            <Shield size={12} color="#006D34" />
            <Text style={styles.dtiBadgeText}>DTI SECURE</Text>
          </View>
        </View>

        {/* Step Indicator Bar */}
        <View style={styles.stepBar}>
          <View style={styles.stepDone}>
            <CheckCircle size={12} color="#006D34" />
            <Text style={styles.stepDoneText}>1. ID Done</Text>
          </View>
          <View style={styles.stepActive}>
            <View style={styles.activeDot} />
            <Text style={styles.stepActiveText}>2. Biometrics</Text>
          </View>
          <View style={styles.stepPending}>
            <Text style={styles.stepPendingText}>3. Market Role</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Live Biometric Selfie Card matching mockup */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.flexRow}>
                <Camera size={16} color="#8F4E00" />
                <Text style={styles.cardSectionTitle}>Live Face Verification</Text>
              </View>
              <View style={styles.activeHudBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.activeHudText}>ACTIVE HUD</Text>
              </View>
            </View>

            {/* Viewfinder simulation */}
            <View style={styles.biometricViewfinder}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' }}
                style={styles.biometricBg}
              />
              <View style={styles.biometricOval}>
                <View style={styles.scannerLine} />
              </View>
              <View style={styles.smileBadge}>
                <Text style={styles.smileText}>Smile & Blink ✓</Text>
              </View>
              <View style={styles.telemetryFooter}>
                <Text style={styles.telemetryText}>60 FPS • ISO 120</Text>
                <Text style={styles.telemetryScore}>ANTI-SPOOF 99.8%</Text>
              </View>
            </View>

            {/* Verified snapshot strip */}
            <View style={styles.snapshotStrip}>
              <View style={styles.flexRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' }}
                  style={styles.smallAvatar}
                />
                <View>
                  <Text style={styles.avatarVerified}>Avatar Verified ✓</Text>
                  <Text style={styles.avatarHash}>SHA-256: 8f42...39b7a</Text>
                </View>
              </View>
              <Text style={styles.scoreBadge}>98% Score</Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Contributor Accreditation</Text>
            <Text style={styles.cardSubtitle}>PhilSys Citizen Database Linked</Text>

            <Text style={styles.label}>Full Legal Name *</Text>
            <TextInput
              value={legalName}
              onChangeText={setLegalName}
              style={styles.input}
            />

            <Text style={styles.label}>Philippine Mobile (+63) *</Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.label}>PhilSys ID Number *</Text>
            <TextInput
              value={philsysId}
              onChangeText={setPhilsysId}
              style={[styles.input, styles.mono]}
            />

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={16} color="#877365" /> : <Eye size={16} color="#877365" />}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
            />

            {/* Accreditation Tier Selector */}
            <Text style={styles.label}>Accreditation Tier *</Text>
            <View style={styles.tierSelectorRow}>
              <TouchableOpacity
                onPress={() => setSelectedTier('tier_1')}
                style={[styles.tierCard, selectedTier === 'tier_1' && styles.tierCardActive]}
              >
                <Text style={styles.tierTag}>TIER 1</Text>
                <Text style={styles.tierTitle}>Citizen Scout</Text>
                <Text style={styles.tierDesc}>Crowdsourced receipts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTier('tier_2')}
                style={[styles.tierCard, selectedTier === 'tier_2' && styles.tierCardActive]}
              >
                <View style={styles.goldBadge}>
                  <Star size={9} color="#8F4E00" fill="#FF9F43" />
                  <Text style={styles.goldText}>GOLD</Text>
                </View>
                <Text style={styles.tierTitle}>Palengke Verifier</Text>
                <Text style={styles.tierDesc}>Wet market price audits</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            activeOpacity={0.88}
          >
            <CheckCircle size={18} color="#FFFFFF" />
            <Text style={styles.registerBtnText}>Complete Registration</Text>
          </TouchableOpacity>
        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 194, 177, 0.3)',
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111C2D',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#877365',
  },
  dtiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dtiBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#006D34',
  },
  stepBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F3FF',
  },
  stepDone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepDoneText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#006D34',
  },
  stepActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FF9F43',
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2E1500',
  },
  stepActiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E1500',
  },
  stepPending: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7EEFF',
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepPendingText: {
    fontSize: 10,
    color: '#877365',
  },
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 14,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111C2D',
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#877365',
    marginBottom: 6,
  },
  activeHudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D26A',
  },
  activeHudText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  biometricViewfinder: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  biometricOval: {
    width: 120,
    height: 150,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#00D26A',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#00D26A',
  },
  smileBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 210, 106, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  smileText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  telemetryFooter: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  telemetryText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  telemetryScore: {
    fontSize: 9,
    color: '#00D26A',
    fontWeight: '800',
  },
  snapshotStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00D26A',
  },
  avatarVerified: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
  },
  avatarHash: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#8F4E00',
  },
  scoreBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#006D34',
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111C2D',
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  tierSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tierCard: {
    flex: 1,
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    padding: 10,
  },
  tierCardActive: {
    backgroundColor: '#FFDCC2',
    borderColor: '#FF9F43',
    borderWidth: 2,
  },
  tierTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#877365',
    marginBottom: 2,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FF9F43',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  goldText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2E1500',
  },
  tierTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111C2D',
  },
  tierDesc: {
    fontSize: 9,
    color: '#544437',
    marginTop: 2,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF9F43',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#FF9F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  registerBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
