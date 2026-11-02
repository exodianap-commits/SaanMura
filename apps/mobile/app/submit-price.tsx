import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Platform, Image, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  X, Camera, Image as ImageIcon, Store as StoreIcon, 
  TrendingDown, TrendingUp, CheckCircle, Shield 
} from 'lucide-react-native';
import { mobileStore } from '../src/services/api';
import { formatPeso, calculatePriceDelta } from '@saanmura/domain';

export default function SubmitPriceScreen() {
  const router = useRouter();
  const { productId, resubmitId } = useLocalSearchParams<{ productId?: string; resubmitId?: string }>();

  const product = mobileStore.getProductById(productId || 'prod-2') || mobileStore.products[1];
  const stores = mobileStore.stores;

  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || '');
  const [observedPrice, setObservedPrice] = useState('39.50');
  const [observationDate, setObservationDate] = useState('2026-10-31');
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1554415707-9e49fe74a659?auto=format&fit=crop&w=400&q=80'
  );
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prevPrice = product.lowest_verified_price || 41.50;
  const numPrice = parseFloat(observedPrice) || 0;
  const delta = calculatePriceDelta(numPrice, prevPrice);

  const handleSubmit = () => {
    if (numPrice <= 0) {
      alert('Please enter a valid observed price.');
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
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* Target Product Summary */}
          <View style={styles.targetCard}>
            <Image
              source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' }}
              style={styles.targetImage}
              resizeMode="cover"
            />
            <View style={styles.targetInfo}>
              <Text style={styles.targetName}>{product.name}</Text>
              <Text style={styles.targetSku}>Barcode: {product.barcode}</Text>
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
            {/* Store Picker */}
            <Text style={styles.fieldLabel}>Select Store / Wet Market *</Text>
            <View style={styles.storePicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeScroll}>
                {stores.map((s: any) => {
                  const isSelected = selectedStoreId === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSelectedStoreId(s.id)}
                      style={[styles.storeChip, isSelected && styles.storeChipSelected]}
                    >
                      <StoreIcon size={13} color={isSelected ? '#8F4E00' : '#544437'} />
                      <Text style={[styles.storeChipText, isSelected && styles.storeChipTextSelected]}>
                        {s.name} ({s.branch_name})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
              <View style={styles.evidenceBox}>
                <Image source={{ uri: evidencePhoto }} style={styles.evidenceImg} />
                <TouchableOpacity 
                  onPress={() => setEvidencePhoto(null)} 
                  style={styles.removePhoto}
                >
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoUploadRow}>
                <TouchableOpacity 
                  style={styles.uploadBtn}
                  onPress={() => setEvidencePhoto('https://images.unsplash.com/photo-1554415707-9e49fe74a659?auto=format&fit=crop&w=400&q=80')}
                >
                  <Camera size={18} color="#8F4E00" />
                  <Text style={styles.uploadBtnText}>Snap Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadBtn}
                  onPress={() => setEvidencePhoto('https://images.unsplash.com/photo-1554415707-9e49fe74a659?auto=format&fit=crop&w=400&q=80')}
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
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  secureText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
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
  targetImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F3FF',
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
    fontSize: 10,
    color: '#877365',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  deltaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
    fontSize: 9,
    fontWeight: '700',
    color: '#877365',
    textTransform: 'uppercase',
  },
  deltaOldPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
    marginTop: 2,
  },
  deltaDifference: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  greenText: {
    color: '#006D34',
  },
  redText: {
    color: '#B52330',
  },
  deltaDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(218, 194, 177, 0.4)',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 14,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111C2D',
    marginTop: 4,
  },
  storePicker: {
    marginBottom: 4,
  },
  storeScroll: {
    gap: 6,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
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
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0F3FF',
  },
  evidenceImg: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#B52330',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 12,
  },
  uploadBtnText: {
    fontSize: 11,
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
});
