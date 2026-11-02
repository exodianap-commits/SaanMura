import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Alert, Platform, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { X, CheckCircle, Camera, Store as StoreIcon, Shield, UploadCloud, ImageIcon } from 'lucide-react-native';
import { mobileStore } from '../src/services/api';

export default function RegisterProductScreen() {
  const router = useRouter();
  const { barcode: initialBarcode } = useLocalSearchParams<{ barcode?: string }>();

  const categories = mobileStore.categories.filter((c: any) => c.slug !== 'all');
  const stores = mobileStore.stores;

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(initialBarcode || '');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [packageQty, setPackageQty] = useState('1');
  const [selectedStore, setSelectedStore] = useState(stores[0]?.id || '');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [productPhoto, setProductPhoto] = useState<string | null>(null);
  const [photoMeta, setPhotoMeta] = useState<{ width?: number; height?: number; fileSize?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSnapCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera Permission Required', 'Please enable camera access to snap a photo of this product.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // Preserves native camera sensor resolution
        quality: 0.6, // Lowers file size by ~70-80% without reducing resolution
        exif: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        setProductPhoto(asset.uri);
        setPhotoMeta({
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        });
      }
    } catch (err) {
      console.log('Product camera snap error:', err);
      Alert.alert('Camera Error', 'Could not open camera.');
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photo Access Required', 'Please enable photo library access to upload a commodity image.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false, // Full resolution preserved
        quality: 0.6, // Compressed byte size
        exif: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        setProductPhoto(asset.uri);
        setPhotoMeta({
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        });
      }
    } catch (err) {
      console.log('Product photo upload error:', err);
      Alert.alert('Upload Error', 'Could not open photo library.');
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !barcode.trim() || !price) {
      alert('Please fill in product name, barcode, and initial price.');
      return;
    }

    setIsSubmitting(true);
    try {
      mobileStore.registerProduct({
        name,
        barcode,
        categoryId: selectedCategory,
        packageQuantity: parseFloat(packageQty) || 1,
        initialStoreId: selectedStore,
        initialPrice: parseFloat(price) || 0,
        observationDate: '2026-10-31',
        description,
        imageUrl: productPhoto || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      });

      Alert.alert(
        'Product Proposal Queued! ✓',
        `${name} has been submitted as Pending Verification. Once approved by a civic verifier, it will be published to the SaanMura national catalog.`,
        [
          {
            text: 'Done',
            onPress: () => router.replace('/(tabs)/contributions'),
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
          <Text style={styles.headerTitle}>Register New Product</Text>
          <View style={styles.badge}>
            <Shield size={12} color="#006D34" />
            <Text style={styles.badgeText}>PENDING REVIEW</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. San Miguel Corned Beef 175g"
              style={styles.input}
            />

            <Text style={styles.label}>Barcode / SKU (Scanned) *</Text>
            <TextInput
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Barcode numbers"
              style={[styles.input, styles.monoText]}
            />

            <Text style={styles.label}>Commodity Category *</Text>
            <View style={styles.catScrollBox}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                {categories.map((cat: any) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {cat.icon} {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Package Quantity</Text>
                <TextInput
                  value={packageQty}
                  onChangeText={setPackageQty}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.flex1}>
                <Text style={styles.label}>Initial Price (₱) *</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  style={[styles.input, { fontWeight: 'bold', color: '#8F4E00' }]}
                />
              </View>
            </View>

            <Text style={styles.label}>Discovered at Store *</Text>
            <View style={styles.catScrollBox}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                {stores.map((s: any) => {
                  const isSelected = selectedStore === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSelectedStore(s.id)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                      <StoreIcon size={12} color={isSelected ? '#8F4E00' : '#544437'} />
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {s.name} ({s.branch_name})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Product Photo Upload */}
            <Text style={styles.label}>Product Package Photo</Text>
            {productPhoto ? (
              <View>
                <View style={styles.photoPreviewBox}>
                  <Image source={{ uri: productPhoto }} style={styles.photoPreviewImg} resizeMode="cover" />
                  <TouchableOpacity 
                    onPress={() => {
                      setProductPhoto(null);
                      setPhotoMeta(null);
                    }} 
                    style={styles.removePhotoBtn}
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
                      📦 {photoMeta.fileSize ? `${(photoMeta.fileSize / 1024).toFixed(0)} KB` : 'Optimized'} • 📐 {photoMeta.width} × {photoMeta.height} px
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
                  <Camera size={16} color="#8F4E00" />
                  <Text style={styles.uploadBtnText}>Snap Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.uploadBtn}
                  onPress={handleUploadPhoto}
                  activeOpacity={0.8}
                >
                  <UploadCloud size={16} color="#8F4E00" />
                  <Text style={styles.uploadBtnText}>Upload Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Description / Specification</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Easy-open can, net weight 175g, spiced brine"
              multiline
              numberOfLines={2}
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <CheckCircle size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting Product...' : 'Submit Product for Verification'}
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#006D34',
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
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  catScrollBox: {
    marginVertical: 4,
  },
  catScroll: {
    gap: 6,
  },
  chip: {
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
  chipSelected: {
    backgroundColor: '#FFDCC2',
    borderColor: '#FF9F43',
  },
  chipText: {
    fontSize: 11,
    color: '#544437',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#8F4E00',
    fontWeight: '800',
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
  photoPreviewBox: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
  },
  photoPreviewImg: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B52330',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploadRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#8F4E00',
  },
  compressionMetaCard: {
    marginTop: 4,
    marginBottom: 6,
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
});
