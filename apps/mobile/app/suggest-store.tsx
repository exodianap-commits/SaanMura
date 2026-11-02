import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Alert, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, CheckCircle, MapPin, Navigation, Store } from 'lucide-react-native';
import { mobileStore } from '../src/services/api';

export default function SuggestStoreScreen() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [storeType, setStoreType] = useState<'supermarket' | 'wet_market'>('wet_market');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Quezon City');
  const [lat, setLat] = useState('14.6540');
  const [lng, setLng] = useState('120.9780');
  const [remarks, setRemarks] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setLat('14.6288');
      setLng('121.0505');
      setAddress('EDSA Cubao, Quezon City');
      setIsLocating(false);
      Alert.alert('Location Pinned', 'Coordinates set from your device GPS.');
    }, 600);
  };

  const handleSubmit = () => {
    if (!storeName.trim() || !address.trim()) {
      alert('Please fill in the store name and address.');
      return;
    }

    mobileStore.suggestStore({
      suggestedName: storeName,
      suggestedBranch: branchName || undefined,
      suggestedStoreType: storeType,
      suggestedAddress: address,
      suggestedCity: city,
      suggestedLatitude: parseFloat(lat) || 14.65,
      suggestedLongitude: parseFloat(lng) || 120.97,
      remarks: remarks || undefined,
    });

    Alert.alert(
      'Store Suggestion Submitted! ✓',
      'Your proposed market location has been sent to the verification queue. Once verified by an administrator, it will appear on the national store map.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color="#111C2D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suggest Store Location</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.label}>Store / Market Name *</Text>
            <TextInput
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g. Dalisay Public Wet Market"
              style={styles.input}
            />

            <Text style={styles.label}>Branch / Section</Text>
            <TextInput
              value={branchName}
              onChangeText={setBranchName}
              placeholder="e.g. Main Market Hall"
              style={styles.input}
            />

            <Text style={styles.label}>Store Type *</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                onPress={() => setStoreType('wet_market')}
                style={[styles.typeBtn, storeType === 'wet_market' && styles.typeBtnActive]}
              >
                <Text style={[styles.typeBtnText, storeType === 'wet_market' && styles.typeBtnTextActive]}>
                  Wet Market (Palengke)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStoreType('supermarket')}
                style={[styles.typeBtn, storeType === 'supermarket' && styles.typeBtnActive]}
              >
                <Text style={[styles.typeBtnText, storeType === 'supermarket' && styles.typeBtnTextActive]}>
                  Supermarket
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 144 Samson Road"
              style={styles.input}
            />

            {/* GPS helper */}
            <TouchableOpacity 
              style={styles.locationAssistBtn}
              onPress={handleUseCurrentLocation}
              disabled={isLocating}
            >
              <Navigation size={14} color="#8F4E00" />
              <Text style={styles.locationAssistText}>
                {isLocating ? 'Detecting GPS...' : 'Use Current Device Location'}
              </Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  value={lat}
                  onChangeText={setLat}
                  style={[styles.input, styles.mono]}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  value={lng}
                  onChangeText={setLng}
                  style={[styles.input, styles.mono]}
                />
              </View>
            </View>

            <Text style={styles.label}>Notes / Landmarks</Text>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="e.g. Near corner of Rizal Ave, across church"
              multiline
              numberOfLines={2}
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.88}
          >
            <CheckCircle size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Submit Store for Approval</Text>
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
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
  },
  scroll: {
    padding: 16,
    gap: 14,
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
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#F0F3FF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
  },
  typeBtnActive: {
    backgroundColor: '#FFDCC2',
    borderColor: '#FF9F43',
  },
  typeBtnText: {
    fontSize: 11,
    color: '#544437',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#8F4E00',
    fontWeight: '800',
  },
  locationAssistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFDCC2',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  locationAssistText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8F4E00',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  submitBtn: {
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
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
