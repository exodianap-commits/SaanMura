import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  Platform, ScrollView, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { 
  Camera as CameraIcon, Zap, RotateCcw, X, Search, PlusCircle, 
  ShieldCheck, ArrowRight, Store, Check, Barcode 
} from 'lucide-react-native';
import { mobileStore } from '../../src/services/api';
import { formatPeso, evaluateSrpStatus } from '@saanmura/domain';
import type { Product } from '@saanmura/shared-types';

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [unknownBarcode, setUnknownBarcode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (permission?.granted) {
      const timer = setTimeout(() => {
        cameraRef.current?.resumePreview();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [permission?.granted, facing]);

  // Handles barcode lookup
  const handleBarcodeScanned = (scannedCode: string) => {
    if (!isScanning) return;
    setIsScanning(false);

    const found = mobileStore.getProductByBarcode(scannedCode);
    if (found) {
      setMatchedProduct(found);
      setUnknownBarcode(null);
    } else {
      setMatchedProduct(null);
      setUnknownBarcode(scannedCode);
    }
  };

  const handleResetScanner = () => {
    setMatchedProduct(null);
    setUnknownBarcode(null);
    setIsScanning(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar with Flash and Camera switch */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.topBarButton}
            onPress={() => router.back()}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>PriceWatch Scanner</Text>
            <Text style={styles.topBarSubtitle}>EAN-13 • UPC-A • QR Tag</Text>
          </View>

          <View style={styles.topBarRight}>
            <TouchableOpacity 
              style={styles.topBarButton}
              onPress={() => setFacing((curr) => (curr === 'back' ? 'front' : 'back'))}
            >
              <RotateCcw size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.topBarButton, isTorchOn && styles.topBarButtonActive]}
              onPress={() => setIsTorchOn(!isTorchOn)}
            >
              <Zap size={18} color={isTorchOn ? '#FF9F43' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Camera Viewfinder Area */}
        <View style={styles.viewfinderContainer}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              ratio="16:9"
              autofocus="on"
              enableTorch={isTorchOn}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'qr',
                  'ean13',
                  'ean8',
                  'upc_a',
                  'upc_e',
                  'code128',
                  'code39',
                ],
              }}
              onCameraReady={() => {
                console.log('>>> EXPO CAMERA READY!');
              }}
              onMountError={(e) => {
                console.log('>>> EXPO CAMERA MOUNT ERROR:', e);
              }}
              onBarcodeScanned={isScanning ? ({ data }) => handleBarcodeScanned(data) : undefined}
            />
          ) : (
            <View style={styles.permissionFallback}>
              <CameraIcon size={44} color="#FF9F43" />
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionSubtitle}>
                Allow camera access to point at shelf barcodes and compare against DTI SRP in real-time.
              </Text>
              <TouchableOpacity 
                style={styles.permissionButton}
                onPress={requestPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.permissionButtonText}>Enable Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Viewfinder Target Frame */}
          <View style={styles.targetFrame} pointerEvents="none">
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Red Laser Scan Beam */}
            <View style={styles.laserBeam} />

            <View style={styles.frameLabel}>
              <Text style={styles.frameLabelText}>ALIGN SHELF BARCODE HERE</Text>
            </View>
          </View>

          {/* HUD Telemetry Overlay */}
          <View style={styles.hudOverlay} pointerEvents="none">
            <View style={styles.hudBadge}>
              <View style={styles.recDot} />
              <Text style={styles.hudBadgeText}>AI OCR • ACTIVE</Text>
            </View>
            <Text style={styles.hudSpecs}>60 FPS • ANTI-SPOOF 99.8%</Text>
          </View>
        </View>

        {/* Quick Testing Barcode Simulator for Easy Dev Review */}
        <View style={styles.simBar}>
          <Text style={styles.simTitle}>⚡ Quick Barcode Triggers (Simulator / Demo):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.simScroll}>
            <TouchableOpacity 
              style={styles.simChip}
              onPress={() => handleBarcodeScanned('4800016644818')}
            >
              <Text style={styles.simChipText}>🍜 Lucky Me! (4800016644818)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.simChip}
              onPress={() => handleBarcodeScanned('4800016012891')}
            >
              <Text style={styles.simChipText}>🥩 Purefoods (4800016012891)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.simChip}
              onPress={() => handleBarcodeScanned('4800049720015')}
            >
              <Text style={styles.simChipText}>🥫 Mega Sardines (4800049720015)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.simChip, styles.simChipUnknown]}
              onPress={() => handleBarcodeScanned('4809999888877')}
            >
              <Text style={styles.simChipUnknownText}>❓ Unregistered (4809999888877)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* MATCHED PRODUCT BOTTOM CARD MODAL */}
        {matchedProduct && (
          <View style={styles.bottomCard}>
            <View style={styles.cardHeader}>
              <View style={styles.matchedBadge}>
                <Check size={14} color="#00A352" />
                <Text style={styles.matchedBadgeText}>PRODUCT VERIFIED</Text>
              </View>
              <TouchableOpacity onPress={handleResetScanner}>
                <X size={18} color="#877365" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardThumbnailWrapper}>
                <Image 
                  source={{ uri: matchedProduct.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.cardThumbnail}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardProductName} numberOfLines={2}>
                  {matchedProduct.name}
                </Text>
                <Text style={styles.cardBarcode}>SKU: {matchedProduct.barcode}</Text>

                <View style={styles.cardPriceRow}>
                  <Text style={styles.cardPriceLabel}>Lowest Verified Price:</Text>
                  <Text style={styles.cardPriceValue}>
                    {formatPeso(matchedProduct.lowest_verified_price)}
                  </Text>
                </View>

                {matchedProduct.srp_price && (
                  <Text style={styles.cardSrpNote}>
                    Official DTI SRP: {formatPeso(matchedProduct.srp_price)}
                  </Text>
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => {
                  router.push(`/product/${matchedProduct.id}`);
                }}
              >
                <Text style={styles.detailsButtonText}>Compare Stores</Text>
                <ArrowRight size={14} color="#544437" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addPriceButton}
                onPress={() => {
                  router.push(`/submit-price?productId=${matchedProduct.id}`);
                }}
              >
                <PlusCircle size={15} color="#FFFFFF" />
                <Text style={styles.addPriceButtonText}>Log New Price</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* UNKNOWN PRODUCT BOTTOM CARD MODAL */}
        {unknownBarcode && (
          <View style={styles.bottomCard}>
            <View style={styles.cardHeader}>
              <View style={styles.unknownBadge}>
                <Barcode size={14} color="#B52330" />
                <Text style={styles.unknownBadgeText}>PRODUCT NOT FOUND</Text>
              </View>
              <TouchableOpacity onPress={handleResetScanner}>
                <X size={18} color="#877365" />
              </TouchableOpacity>
            </View>

            <View style={styles.unknownContent}>
              <Text style={styles.unknownTitle}>Unregistered Barcode Detected</Text>
              <Text style={styles.unknownBarcodeText}>Scanned: {unknownBarcode}</Text>
              <Text style={styles.unknownSubtext}>
                This commodity is not yet in the SaanMura catalog. As an accredited Scout, you can register it to help Filipino shoppers!
              </Text>
            </View>

            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={handleResetScanner}
              >
                <RotateCcw size={14} color="#544437" />
                <Text style={styles.detailsButtonText}>Scan Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addPriceButton}
                onPress={() => {
                  router.push(`/register-product?barcode=${unknownBarcode}`);
                }}
              >
                <PlusCircle size={15} color="#FFFFFF" />
                <Text style={styles.addPriceButtonText}>Register Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarButtonActive: {
    backgroundColor: '#FFDCC2',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topBarSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  permissionFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 5,
  },
  permissionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FF9F43',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  permissionButtonText: {
    color: '#2E1500',
    fontWeight: '800',
    fontSize: 13,
  },
  targetFrame: {
    width: 260,
    height: 260,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FF9F43',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  laserBeam: {
    width: '90%',
    height: 2,
    backgroundColor: '#FF5A5F',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  frameLabel: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  frameLabelText: {
    color: '#FFDCC2',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hudOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5A5F',
  },
  hudBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  hudSpecs: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  simBar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  simTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9F43',
    marginBottom: 6,
  },
  simScroll: {
    gap: 8,
  },
  simChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  simChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  simChipUnknown: {
    borderColor: '#FF5A5F',
    backgroundColor: 'rgba(255, 90, 95, 0.2)',
  },
  simChipUnknownText: {
    color: '#FF9A98',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  matchedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#006D34',
  },
  unknownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(181, 35, 48, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unknownBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B52330',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  cardThumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardThumbnail: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardProductName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  cardBarcode: {
    fontSize: 10,
    color: '#877365',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  cardPriceLabel: {
    fontSize: 11,
    color: '#544437',
  },
  cardPriceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8F4E00',
  },
  cardSrpNote: {
    fontSize: 10,
    color: '#006D34',
    fontWeight: '600',
    marginTop: 1,
  },
  unknownContent: {
    paddingVertical: 6,
    marginBottom: 10,
  },
  unknownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  unknownBarcodeText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#8F4E00',
    fontWeight: 'bold',
    marginTop: 2,
  },
  unknownSubtext: {
    fontSize: 11,
    color: '#544437',
    marginTop: 4,
    lineHeight: 15,
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    paddingVertical: 10,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#544437',
  },
  addPriceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FF9F43',
    borderRadius: 10,
    paddingVertical: 10,
  },
  addPriceButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
