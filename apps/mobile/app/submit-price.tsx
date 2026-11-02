import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Platform, Image, Alert, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { 
  X, Camera, Image as ImageIcon, Store as StoreIcon, 
  TrendingDown, TrendingUp, CheckCircle, Shield, 
  MapPin, PlusCircle, Maximize2, AlertCircle 
} from 'lucide-react-native';
import { mobileStore } from '../src/services/api';
import { formatPeso, calculatePriceDelta } from '@saanmura/domain';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function SubmitPriceScreen() {
  const router = useRouter();
  const { productId, resubmitId } = useLocalSearchParams<{ productId?: string; resubmitId?: string }>();

  const product = mobileStore.getProductById(productId || 'prod-2') || mobileStore.products[1];
  const stores = mobileStore.stores;

  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || '');
  const [observedPrice, setObservedPrice] = useState(product.lowest_verified_price?.toFixed(2) || '39.50');
  const [observationDate, setObservationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [photoMeta, setPhotoMeta] = useState<{ width?: number; height?: number; fileSize?: number } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewModalUri, setPreviewModalUri] = useState<string | null>(null);

  // Request location & geofence stores
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch (err) {
        console.log('Location error in submit-price:', err);
      }
    })();
  }, []);

  // Compute distance and sort stores with the nearest first
  const storesWithDistance = useMemo(() => {
    return stores.map((s) => {
      let distanceKm: number | null = null;
      if (userCoords && s.latitude && s.longitude) {
        distanceKm = calculateDistanceKm(userCoords.latitude, userCoords.longitude, s.latitude, s.longitude);
      }
      return { ...s, distanceKm };
    }).sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });
  }, [stores, userCoords]);

  // Set default to nearest store once GPS is acquired
  useEffect(() => {
    if (storesWithDistance[0]?.id && !selectedStoreId) {
      setSelectedStoreId(storesWithDistance[0].id);
    }
  }, [storesWithDistance, selectedStoreId]);

  const prevPrice = product.lowest_verified_price || 41.50;
  const numPrice = parseFloat(observedPrice) || 0;
  const delta = calculatePriceDelta(numPrice, prevPrice);

  const handleSnapCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Access Needed', 'Please allow camera permission to capture shelf barcode or receipt.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // Disables OEM downsampling/cropping to strictly preserve native sensor resolution
        quality: 0.6, // Efficient DCT compression: lowers file size by ~70-80% without reducing resolution
        exif: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        setEvidencePhoto(asset.uri);
        setPhotoMeta({
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        });
      }
    } catch (err) {
      console.log('Camera snap error:', err);
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photo Access Needed', 'Please allow access to your photo library to select receipt evidence.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false, // Strictly preserves native image resolution & aspect ratio
        quality: 0.6, // Compresses byte footprint while keeping resolution untouched
        exif: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        setEvidencePhoto(asset.uri);
        setPhotoMeta({
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        });
      }
    } catch (err) {
      console.log('Upload photo error:', err);
      Alert.alert('Upload Error', 'Could not open photo library.');
    }
  };

  const handleSubmit = () => {
    if (numPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid observed shelf price.');
      return;
    }
    setIsSubmitting(true);
    try {
      mobileStore.submitPriceObservation({
        productId: product.id,
        storeId: selectedStoreId,
        observedPrice: numPrice,
        observationDate,
        evidenceImageUrl: evidencePhoto || undefined,
        remarks: remarks.trim() || undefined,
      });

      Alert.alert(
        'Submission Received! ✓',
        `Your price observation for ${product.name} (₱${numPrice.toFixed(2)}) has been queued for civic verifier consensus review.`,
        [
          {
            text: 'View Activity Log',
            onPress: () => {
              router.replace('/(tabs)/contributions');
            },
          },
        ]
      );
    } catch (err: unknown) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const productImageUrl = product.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={20} color="#111C2D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Price Observation</Text>
          <View style={styles.secureBadge}>
            <Shield size={12} color="#006D34" />
            <Text style={styles.secureText}>RA 7581</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Target Product Summary with Clickable Image */}
          <View style={styles.targetCard}>
            <TouchableOpacity 
              activeOpacity={0.85}
              onPress={() => setPreviewModalUri(productImageUrl)}
              style={styles.targetImageWrapper}
            >
              <Image
                source={{ uri: productImageUrl }}
                style={styles.targetImage}
                resizeMode="cover"
              />
              <View style={styles.zoomHintBadge}>
                <Maximize2 size={10} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.targetInfo}>
              <Text style={styles.targetName}>{product.name}</Text>
              <Text style={styles.targetSku}>Barcode: {product.barcode}</Text>
              <Text style={styles.tapToViewText}>🔍 Tap image to view full size</Text>
            </View>
          </View>

          {/* Previous Price vs New Observed Price Delta Box */}
          <View style={styles.deltaCard}>
            <View style={styles.deltaRow}>
              <View>
                <Text style={styles.deltaLabel}>Previous Verified Price</Text>
                <Text style={styles.deltaOldPrice}>{formatPeso(prevPrice)}</Text>
              </View>

              <View style={styles.deltaDivider} />

              <View>
                <Text style={styles.deltaLabel}>Difference</Text>
                <Text style={[
                  styles.deltaDifference,
                  delta.direction === 'decrease' ? styles.greenText : styles.redText
                ]}>
                  {delta.formattedDifference}
                </Text>
              </View>

              <View style={styles.deltaDivider} />

              <View>
                <Text style={styles.deltaLabel}>Price Change</Text>
                <Text style={[
                  styles.deltaDifference,
                  delta.direction === 'decrease' ? styles.greenText : styles.redText
                ]}>
                  {delta.formattedPercentage}
                </Text>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Store Picker with Geofence Distance */}
            <View style={styles.storeHeaderRow}>
              <Text style={styles.fieldLabel}>Select Store / Wet Market *</Text>
              {userCoords ? (
                <View style={styles.geoBadge}>
                  <MapPin size={11} color="#006D34" />
                  <Text style={styles.geoBadgeText}>GPS Geofence Nearest</Text>
                </View>
              ) : (
                <Text style={styles.geoSearchingText}>📍 Locating nearest store...</Text>
              )}
            </View>

            <View style={styles.storePicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeScroll}>
                {storesWithDistance.map((s, index) => {
                  const isSelected = selectedStoreId === s.id;
                  const isNearest = index === 0 && s.distanceKm !== null;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSelectedStoreId(s.id)}
                      style={[
                        styles.storeChip, 
                        isSelected && styles.storeChipSelected,
                        isNearest && styles.storeChipNearest
                      ]}
                      activeOpacity={0.8}
                    >
                      <StoreIcon size={14} color={isSelected ? '#8F4E00' : isNearest ? '#006D34' : '#544437'} />
                      <View>
                        <Text style={[styles.storeChipText, isSelected && styles.storeChipTextSelected]}>
                          {s.name} ({s.branch_name})
                        </Text>
                        {s.distanceKm !== null && (
                          <Text style={[styles.storeDistText, isSelected && styles.storeDistTextSelected]}>
                            {isNearest ? `🎯 Nearest (~${s.distanceKm < 1 ? Math.round(s.distanceKm * 1000) + 'm' : s.distanceKm.toFixed(1) + 'km'})` : `~${s.distanceKm.toFixed(1)} km away`}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Option to Add New Store (Pending Verification) */}
                <TouchableOpacity
                  style={styles.addStoreChip}
                  onPress={() => router.push('/suggest-store')}
                  activeOpacity={0.8}
                >
                  <PlusCircle size={15} color="#8F4E00" />
                  <View>
                    <Text style={styles.addStoreChipText}>+ Add Unlisted Store</Text>
                    <Text style={styles.addStoreSubtext}>Subject to verification</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Price Input */}
            <Text style={styles.fieldLabel}>Observed Shelf / Stall Price (₱) *</Text>
            <View style={styles.inputBox}>
              <Text style={styles.pesoSign}>₱</Text>
              <TextInput
                value={observedPrice}
                onChangeText={setObservedPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                style={styles.priceInput}
              />
            </View>

            {/* Observation Date */}
            <Text style={styles.fieldLabel}>Observation Date</Text>
            <TextInput
              value={observationDate}
              onChangeText={setObservationDate}
              placeholder="YYYY-MM-DD"
              style={styles.standardInput}
            />

            {/* Evidence Image Preview */}
            <Text style={styles.fieldLabel}>Shelf Barcode or Receipt Photo Evidence</Text>
            {evidencePhoto ? (
              <View>
                <View style={styles.evidenceBox}>
                  <TouchableOpacity 
                    activeOpacity={0.9} 
                    onPress={() => setPreviewModalUri(evidencePhoto)}
                    style={styles.evidenceTouchable}
                  >
                    <Image 
                      source={{ uri: evidencePhoto }} 
                      style={styles.evidenceImg} 
                      resizeMode="cover"
                    />
                    <View style={styles.viewFullOverlay}>
                      <Maximize2 size={12} color="#FFFFFF" />
                      <Text style={styles.viewFullText}>Tap to view full screen</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => {
                      setEvidencePhoto(null);
                      setPhotoMeta(null);
                    }} 
                    style={styles.removePhoto}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {photoMeta && (
                  <View style={styles.compressionMetaCard}>
                    <View style={styles.compressionMetaBadge}>
                      <CheckCircle size={11} color="#006D34" />
                      <Text style={styles.compressionMetaBadgeText}>COMPRESSED • FULL RESOLUTION</Text>
                    </View>
                    <Text style={styles.compressionMetaDetails}>
                      📦 Size: {photoMeta.fileSize ? `${(photoMeta.fileSize / 1024).toFixed(0)} KB` : 'Optimized'} • 📐 {photoMeta.width} × {photoMeta.height} px
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.photoUploadRow}>
                <TouchableOpacity 
                  style={styles.uploadBtn}
                  onPress={handleSnapCamera}
                  activeOpacity={0.8}
                >
                  <Camera size={18} color="#8F4E00" />
                  <Text style={styles.uploadBtnText}>Snap Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadBtn}
                  onPress={handleUploadPhoto}
                  activeOpacity={0.8}
                >
                  <ImageIcon size={18} color="#8F4E00" />
                  <Text style={styles.uploadBtnText}>Upload Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Remarks */}
            <Text style={styles.fieldLabel}>Scout Remarks / Promotion Condition</Text>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="e.g. Promo tag valid until Sunday; Price applies to 80g pack"
              multiline
              numberOfLines={2}
              style={[styles.standardInput, { height: 60, textAlignVertical: 'top' }]}
            />
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <CheckCircle size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting to Queue...' : 'Submit for Verification'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fullscreen Photo Lightbox Modal */}
        <Modal
          visible={!!previewModalUri}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewModalUri(null)}
        >
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Image Preview</Text>
                <TouchableOpacity 
                  onPress={() => setPreviewModalUri(null)}
                  style={styles.modalCloseBtn}
                >
                  <X size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalImageWrapper}>
                {previewModalUri && (
                  <Image 
                    source={{ uri: previewModalUri }} 
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </SafeAreaView>
          </View>
        </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 194, 177, 0.4)',
    backgroundColor: '#FFFFFF',
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
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 109, 52, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  secureText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#006D34',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 10,
  },
  targetImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F3FF',
  },
  targetImage: {
    width: '100%',
    height: '100%',
  },
  zoomHintBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 4,
    padding: 2,
  },
  targetInfo: {
    flex: 1,
  },
  targetName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  targetSku: {
    fontSize: 11,
    color: '#877365',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  tapToViewText: {
    fontSize: 10,
    color: '#8F4E00',
    fontWeight: '600',
    marginTop: 3,
  },
  deltaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 12,
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  deltaLabel: {
    fontSize: 10,
    color: '#877365',
    fontWeight: '600',
    marginBottom: 2,
  },
  deltaOldPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111C2D',
  },
  deltaDifference: {
    fontSize: 14,
    fontWeight: '800',
  },
  deltaDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(218, 194, 177, 0.5)',
  },
  greenText: {
    color: '#006D34',
  },
  redText: {
    color: '#B52330',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 14,
    gap: 10,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 4,
  },
  geoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 109, 52, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  geoBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#006D34',
  },
  geoSearchingText: {
    fontSize: 9,
    color: '#877365',
  },
  storePicker: {
    marginBottom: 4,
  },
  storeScroll: {
    gap: 8,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
  },
  storeChipNearest: {
    borderColor: '#006D34',
    borderWidth: 1.5,
  },
  storeChipSelected: {
    backgroundColor: '#FFDCC2',
    borderColor: '#FF9F43',
  },
  storeChipText: {
    fontSize: 11,
    color: '#544437',
    fontWeight: '600',
  },
  storeChipTextSelected: {
    color: '#8F4E00',
    fontWeight: '800',
  },
  storeDistText: {
    fontSize: 9,
    color: '#006D34',
    fontWeight: '600',
    marginTop: 1,
  },
  storeDistTextSelected: {
    color: '#8F4E00',
    fontWeight: '700',
  },
  addStoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#FF9F43',
  },
  addStoreChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8F4E00',
  },
  addStoreSubtext: {
    fontSize: 9,
    color: '#877365',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingHorizontal: 12,
    height: 46,
  },
  pesoSign: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8F4E00',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
  },
  standardInput: {
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111C2D',
  },
  evidenceBox: {
    position: 'relative',
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#111C2D',
  },
  evidenceTouchable: {
    flex: 1,
  },
  evidenceImg: {
    width: '100%',
    height: '100%',
  },
  viewFullOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewFullText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removePhoto: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B52330',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  compressionMetaCard: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 210, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 82, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compressionMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compressionMetaBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  compressionMetaDetails: {
    fontSize: 10,
    fontWeight: '600',
    color: '#344054',
  },
  photoUploadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingVertical: 14,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8F4E00',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
