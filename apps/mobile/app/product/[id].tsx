import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  Platform, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, Share2, Bookmark, ShieldCheck, Store, MapPin, 
  PlusCircle, AlertTriangle, TrendingDown, Clock, Award, X, Maximize2 
} from 'lucide-react-native';
import { mobileStore } from '../../src/services/api';
import { formatPeso, evaluateSrpStatus } from '@saanmura/domain';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<'7D' | '30D' | '3M' | '1Y'>('30D');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const product = mobileStore.getProductById(id || 'prod-2') || mobileStore.products[1];
  const srpEval = evaluateSrpStatus(product.lowest_verified_price || 0, product.srp_price);

  // Store comparison list sorted lowest to highest
  const storeComparisons = [
    {
      storeName: 'Puregold',
      branch: 'Paso de Blas',
      price: product.lowest_verified_price || 39.50,
      distance: '1.2 km',
      isLowest: true,
      observedAgo: '2h ago',
      isStale: false,
    },
    {
      storeName: 'SM Supermarket',
      branch: 'SM Megamall',
      price: (product.lowest_verified_price || 39.50) + 1.50,
      distance: '3.4 km',
      isLowest: false,
      observedAgo: '1d ago',
      isStale: false,
    },
    {
      storeName: 'Robinsons Supermarket',
      branch: 'Galleria',
      price: (product.lowest_verified_price || 39.50) + 2.00,
      distance: '4.1 km',
      isLowest: false,
      observedAgo: '2d ago',
      isStale: false,
    },
    {
      storeName: 'Nepa Q-Mart Palengke',
      branch: 'Stall 14',
      price: (product.lowest_verified_price || 39.50) + 0.50,
      distance: '5.2 km',
      isLowest: false,
      observedAgo: '3d ago',
      isStale: false,
    },
    {
      storeName: '7-Eleven',
      branch: 'Philam Life',
      price: (product.lowest_verified_price || 39.50) + 3.30,
      distance: '0.8 km',
      isLowest: false,
      observedAgo: '5d ago',
      isStale: true,
    },
  ].sort((a, b) => a.price - b.price);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#111C2D" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Price History & Analytics</Text>
            <Text style={styles.headerSubtitle}>SaanMura PriceWatch PH</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Share2 size={18} color="#544437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Bookmark size={18} color="#8F4E00" fill="#FF9F43" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Commodity Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.ribbonRow}>
              <View style={styles.necessityChip}>
                <ShieldCheck size={11} color="#006D34" />
                <Text style={styles.necessityChipText}>BASIC NECESSITY (RA 7581)</Text>
              </View>
              <Text style={styles.skuText}>SKU: {product.barcode}</Text>
            </View>

            <View style={styles.productMainRow}>
              <TouchableOpacity 
                style={styles.imageBox}
                activeOpacity={0.85}
                onPress={() => setIsImageModalOpen(true)}
              >
                <Image
                  source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.prodImage}
                  resizeMode="cover"
                />
                <View style={styles.zoomBadge}>
                  <Maximize2 size={11} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.mainInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.pkgText}>Net Wt. {product.package_quantity} {product.unit?.abbreviation || 'g'} • Retail Pack</Text>

                <View style={styles.benchmarkRow}>
                  <Text style={styles.priceHeading}>
                    {formatPeso(product.lowest_verified_price)}
                  </Text>
                  <Text style={styles.avgScanned}>lowest verified</Text>
                </View>

                {srpEval.status === 'below_srp' && (
                  <View style={styles.srpDiffBadge}>
                    <TrendingDown size={12} color="#006D34" />
                    <Text style={styles.srpDiffText}>{srpEval.badgeLabel}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 3-Column Bento Strip */}
            <View style={styles.bentoStrip}>
              <View style={styles.bentoTile}>
                <Text style={styles.bentoLabelGreen}>Lowest Deal</Text>
                <Text style={styles.bentoPriceGreen}>{formatPeso(product.lowest_verified_price)}</Text>
                <Text style={styles.bentoStore} numberOfLines={1}>Puregold Paso de Blas</Text>
              </View>

              <View style={styles.bentoTile}>
                <Text style={styles.bentoLabelMuted}>Official SRP</Text>
                <Text style={styles.bentoPriceMuted}>{formatPeso(product.srp_price)}</Text>
                <Text style={styles.bentoStore} numberOfLines={1}>DTI NCR E-Presyo</Text>
              </View>

              <View style={styles.bentoTile}>
                <Text style={styles.bentoLabelRed}>Highest Peak</Text>
                <Text style={styles.bentoPriceRed}>{formatPeso((product.lowest_verified_price || 39.5) + 3.3)}</Text>
                <Text style={styles.bentoStore} numberOfLines={1}>7-Eleven Mart</Text>
              </View>
            </View>
          </View>

          {/* Interactive Trend Chart Card */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Trend Analytics</Text>
                <Text style={styles.chartSubtitle}>Supermarkets vs Wet Markets</Text>
              </View>
              <View style={styles.liveChip}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveChipText}>Live 24h</Text>
              </View>
            </View>

            {/* Range Switcher */}
            <View style={styles.rangeRow}>
              {(['7D', '30D', '3M', '1Y'] as const).map((range) => {
                const isActive = selectedRange === range;
                return (
                  <TouchableOpacity
                    key={range}
                    onPress={() => setSelectedRange(range)}
                    style={[styles.rangePill, isActive && styles.rangePillActive]}
                  >
                    <Text style={[styles.rangeText, isActive && styles.rangeTextActive]}>
                      {range}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Price Trend Bar / Curve Mockup representation */}
            <View style={styles.chartVisual}>
              <View style={styles.trendRow}>
                <Text style={styles.chartYLabel}>₱43</Text>
                <View style={styles.chartGridLine} />
              </View>
              <View style={styles.trendRow}>
                <Text style={styles.chartYLabel}>₱41</Text>
                <View style={styles.chartGridLine} />
              </View>
              <View style={styles.trendRow}>
                <Text style={styles.chartYLabel}>₱39</Text>
                <View style={styles.chartGridLine} />
              </View>

              <View style={styles.trendBarCluster}>
                <View style={[styles.bar, { height: 60, backgroundColor: '#00D26A' }]} />
                <View style={[styles.bar, { height: 75, backgroundColor: '#FF9F43' }]} />
                <View style={[styles.bar, { height: 70, backgroundColor: '#FF9F43' }]} />
                <View style={[styles.bar, { height: 55, backgroundColor: '#00D26A' }]} />
                <View style={[styles.bar, { height: 50, backgroundColor: '#00D26A' }]} />
                <View style={[styles.bar, { height: 85, backgroundColor: '#FF5A5F' }]} />
              </View>
            </View>
          </View>

          {/* Store Price Comparison (Lowest to Highest) */}
          <View style={styles.storesSection}>
            <View style={styles.storesHeader}>
              <Text style={styles.storesTitle}>Store Price Comparison</Text>
              <Text style={styles.storesSubtitle}>Sorted from lowest to highest price</Text>
            </View>

            <View style={styles.storesList}>
              {storeComparisons.map((store, index) => (
                <View key={index} style={styles.storeCard}>
                  <View style={styles.storeLeft}>
                    <View style={styles.storeIconWrapper}>
                      <Store size={18} color={store.isLowest ? '#00D26A' : '#8F4E00'} />
                    </View>
                    <View>
                      <View style={styles.storeNameRow}>
                        <Text style={styles.storeCardName}>{store.storeName}</Text>
                        {store.isLowest && (
                          <View style={styles.lowestBadge}>
                            <Text style={styles.lowestBadgeText}>BEST PRICE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.storeAddress}>{store.branch} • {store.distance}</Text>
                      {store.isStale && (
                        <View style={styles.staleRow}>
                          <Clock size={10} color="#FF5A5F" />
                          <Text style={styles.staleText}>Price observation is 5 days old</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.storeRight}>
                    <Text style={styles.storePrice}>{formatPeso(store.price)}</Text>
                    <Text style={styles.observedTime}>{store.observedAgo}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Contributor Attribution Card */}
          <View style={styles.attributionCard}>
            <View style={styles.attribHeader}>
              <Award size={16} color="#8F4E00" />
              <Text style={styles.attribTitle}>Civic Contributor Attribution</Text>
            </View>
            <Text style={styles.attribBody}>
              Observed by <Text style={styles.boldText}>Rafael Santos</Text> (Tier-2 Scout) and verified by <Text style={styles.boldText}>Maria Santos</Text> (DTI LGU Verifier) on Oct 31, 2026.
            </Text>
          </View>
        </ScrollView>

        {/* Floating Bottom Bar: Add Price Action */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addPriceCTA}
            onPress={() => router.push(`/submit-price?productId=${product.id}`)}
            activeOpacity={0.88}
          >
            <PlusCircle size={18} color="#FFFFFF" />
            <Text style={styles.addPriceCTAText}>Log Observed Price at Another Store</Text>
          </TouchableOpacity>
        </View>

        {/* Full Image Preview Modal */}
        <Modal
          visible={isImageModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsImageModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{product.name}</Text>
                <TouchableOpacity 
                  onPress={() => setIsImageModalOpen(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalImageWrapper}>
                <Image 
                  source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' }} 
                  style={styles.modalImage}
                  resizeMode="contain"
                />
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 194, 177, 0.3)',
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
  },
  headerTitleContainer: {
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 90,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 14,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  ribbonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  necessityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFDCC2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  necessityChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8F4E00',
  },
  skuText: {
    fontSize: 10,
    color: '#877365',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  productMainRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imageBox: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 4,
    padding: 2,
  },
  prodImage: {
    width: '100%',
    height: '100%',
  },
  mainInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
    lineHeight: 19,
  },
  pkgText: {
    fontSize: 11,
    color: '#544437',
    marginTop: 2,
  },
  benchmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  priceHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111C2D',
  },
  avgScanned: {
    fontSize: 11,
    color: '#877365',
  },
  srpDiffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  srpDiffText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  bentoStrip: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(218, 194, 177, 0.3)',
    paddingTop: 10,
  },
  bentoTile: {
    flex: 1,
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  bentoLabelGreen: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
    textTransform: 'uppercase',
  },
  bentoPriceGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#006D34',
    marginVertical: 2,
  },
  bentoLabelMuted: {
    fontSize: 9,
    fontWeight: '800',
    color: '#877365',
    textTransform: 'uppercase',
  },
  bentoPriceMuted: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111C2D',
    marginVertical: 2,
  },
  bentoLabelRed: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B52330',
    textTransform: 'uppercase',
  },
  bentoPriceRed: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B52330',
    marginVertical: 2,
  },
  bentoStore: {
    fontSize: 9,
    color: '#544437',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111C2D',
  },
  chartSubtitle: {
    fontSize: 10,
    color: '#877365',
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D26A',
  },
  liveChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  rangePill: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 7,
    alignItems: 'center',
  },
  rangePillActive: {
    backgroundColor: '#FF9F43',
  },
  rangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#544437',
  },
  rangeTextActive: {
    color: '#2E1500',
    fontWeight: '800',
  },
  chartVisual: {
    height: 110,
    justifyContent: 'space-between',
    position: 'relative',
    paddingVertical: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartYLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#877365',
    width: 24,
  },
  chartGridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7EEFF',
  },
  trendBarCluster: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 90,
  },
  bar: {
    width: 22,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  storesSection: {
    gap: 8,
  },
  storesHeader: {
    marginBottom: 2,
  },
  storesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111C2D',
  },
  storesSubtitle: {
    fontSize: 10,
    color: '#877365',
  },
  storesList: {
    gap: 8,
  },
  storeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 10,
  },
  storeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  storeIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  lowestBadge: {
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lowestBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#006D34',
  },
  storeAddress: {
    fontSize: 10,
    color: '#544437',
    marginTop: 1,
  },
  staleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  staleText: {
    fontSize: 9,
    color: '#FF5A5F',
    fontWeight: '600',
  },
  storeRight: {
    alignItems: 'flex-end',
  },
  storePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
  },
  observedTime: {
    fontSize: 9,
    color: '#877365',
  },
  attributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 12,
  },
  attribHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  attribTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8F4E00',
  },
  attribBody: {
    fontSize: 11,
    color: '#544437',
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#111C2D',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(218, 194, 177, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addPriceCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF9F43',
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#FF9F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addPriceCTAText: {
    fontSize: 13,
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
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
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
    padding: 14,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
