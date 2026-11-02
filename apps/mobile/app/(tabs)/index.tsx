import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Image, FlatList, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { 
  Store, Bell, Barcode, Search, Camera, ChevronDown, 
  ShieldCheck, ArrowUpRight, TrendingDown, LayoutGrid, ListFilter, X, MapPin 
} from 'lucide-react-native';
import { mobileStore } from '../../src/services/api';
import { formatPeso, evaluateSrpStatus } from '@saanmura/domain';
import type { Product } from '@saanmura/shared-types';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(false);
  const [municipalityName, setMunicipalityName] = useState('Metro Manila (NCR)');
  const [isLocating, setIsLocating] = useState(false);

  const detectLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geo) {
        const cityOrMuni = geo.city || geo.subregion || geo.district || geo.name || 'Metro Manila';
        const provinceOrRegion = geo.region || geo.country || 'NCR';
        setMunicipalityName(`${cityOrMuni} (${provinceOrRegion})`);
      }
    } catch (err) {
      console.log('Location detection error:', err);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const categories = mobileStore.categories;
  const products = mobileStore.getProducts({
    categorySlug: selectedCategory,
    search: searchQuery,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* 1. App Top Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Store size={18} color="#8F4E00" />
            </View>
            <View>
              <Text style={styles.brandTitle}>SaanMura</Text>
              <TouchableOpacity 
                style={styles.locationSelector} 
                activeOpacity={0.7}
                onPress={detectLocation}
              >
                <Text style={styles.locationText}>
                  📍 {isLocating ? 'Detecting GPS...' : municipalityName}
                </Text>
                <ChevronDown size={14} color="#544437" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/(tabs)/contributions')}
            >
              <Bell size={20} color="#544437" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Hero Action: Instant Barcode Scanner Banner */}
        <TouchableOpacity 
          style={styles.scannerBanner}
          onPress={() => router.push('/(tabs)/scan')}
          activeOpacity={0.9}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>⚡ INSTANT SHELF SCAN</Text>
            </View>
            <Text style={styles.bannerHeading}>Scan Barcode or Shelf QR</Text>
            <Text style={styles.bannerSubheading}>
              Compare retail prices against DTI Suggested Retail Price (SRP) in 1 second.
            </Text>
          </View>

          <View style={styles.bannerScanButton}>
            <Camera size={26} color="#8F4E00" />
            <Text style={styles.bannerButtonLabel}>SCAN</Text>
          </View>
        </TouchableOpacity>

        {/* 3. Search Bar with instant barcode trigger */}
        <View style={styles.searchBarContainer}>
          <Search size={18} color="#877365" style={styles.searchIcon} />
          <TextInput
            placeholder="Search brand, grocery, or market..."
            placeholderTextColor="#877365"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color="#877365" />
            </TouchableOpacity>
          )}
          <View style={styles.searchDivider} />
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/scan')}
            style={styles.searchScanTrigger}
          >
            <Barcode size={20} color="#8F4E00" />
          </TouchableOpacity>
        </View>

        {/* 4. Horizontal Category Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.slug)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 5. Live Community Price Stream Header */}
        <View style={styles.streamHeader}>
          <View style={styles.streamHeaderLeft}>
            <View style={styles.livePulse} />
            <Text style={styles.streamTitle}>Community Price Stream</Text>
          </View>

          <View style={styles.streamHeaderRight}>
            <TouchableOpacity 
              onPress={() => setIsGridView(!isGridView)}
              style={styles.viewToggle}
            >
              <LayoutGrid size={16} color={isGridView ? '#8F4E00' : '#877365'} />
            </TouchableOpacity>
            <Text style={styles.updatedTime}>Updated 4m ago</Text>
          </View>
        </View>

        {/* 6. Products Feed */}
        <View style={styles.productsList}>
          {products.map((item) => {
            const srpEval = evaluateSrpStatus(item.lowest_verified_price || 0, item.srp_price);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.9}
              >
                <View style={styles.productCardInner}>
                  {/* Thumbnail */}
                  <View style={styles.productImageWrapper}>
                    <Image
                      source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Body */}
                  <View style={styles.productDetails}>
                    {/* Badges */}
                    <View style={styles.badgeRow}>
                      <View style={styles.dtiBadge}>
                        <ShieldCheck size={11} color="#00A352" />
                        <Text style={styles.dtiBadgeText}>DTI VERIFIED</Text>
                      </View>

                      {srpEval.status === 'below_srp' && (
                        <View style={styles.srpBadgeGreen}>
                          <Text style={styles.srpBadgeGreenText}>
                            {srpEval.badgeLabel}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Title */}
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* Store location tag */}
                    <View style={styles.storeRow}>
                      <Store size={13} color="#8F4E00" />
                      <Text style={styles.storeName} numberOfLines={1}>
                        Puregold Paso de Blas
                      </Text>
                    </View>

                    {/* Price and Action Row */}
                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.priceValue}>
                          {formatPeso(item.lowest_verified_price)}
                        </Text>
                        <Text style={styles.priceSubtext}>
                          {item.stores_count} stores comparing
                        </Text>
                      </View>

                      <View style={styles.compareButton}>
                        <Text style={styles.compareButtonText}>Compare</Text>
                        <ArrowUpRight size={13} color="#8F4E00" />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFDCC2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#8F4E00',
    letterSpacing: -0.3,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: -2,
  },
  locationText: {
    fontSize: 11,
    color: '#544437',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B52330',
  },
  scannerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF9F43',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#8F4E00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  bannerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2E1500',
  },
  bannerHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E1500',
    lineHeight: 20,
  },
  bannerSubheading: {
    fontSize: 11,
    color: 'rgba(46, 21, 0, 0.85)',
    marginTop: 2,
    lineHeight: 15,
  },
  bannerScanButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bannerButtonLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8F4E00',
    marginTop: 2,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111C2D',
  },
  clearSearchBtn: {
    padding: 4,
    marginRight: 4,
  },
  searchDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(218, 194, 177, 0.6)',
    marginHorizontal: 8,
  },
  searchScanTrigger: {
    padding: 4,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
  },
  categoryChipSelected: {
    backgroundColor: '#FF9F43',
    borderColor: '#FF9F43',
  },
  catIcon: {
    fontSize: 13,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#544437',
  },
  categoryChipTextSelected: {
    color: '#2E1500',
    fontWeight: '800',
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  streamHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D26A',
  },
  streamTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  streamHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggle: {
    padding: 2,
  },
  updatedTime: {
    fontSize: 11,
    color: '#877365',
  },
  productsList: {
    gap: 10,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.35)',
    padding: 10,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  productCardInner: {
    flexDirection: 'row',
    gap: 12,
  },
  productImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F0F3FF',
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dtiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0, 210, 106, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dtiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00A352',
  },
  srpBadgeGreen: {
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  srpBadgeGreenText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
    lineHeight: 17,
    marginTop: 2,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  storeName: {
    fontSize: 11,
    color: '#544437',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111C2D',
  },
  priceSubtext: {
    fontSize: 10,
    color: '#877365',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFDCC2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compareButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8F4E00',
  },
});
