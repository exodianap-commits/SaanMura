import React, { useState, useEffect, useRef } from 'react';
import type { Category, Unit, Store } from '@saanmura/shared-types';
import { 
  Camera, ScanLine, UploadCloud, Image as ImageIcon, 
  Store as StoreIcon, CheckCircle2, X, AlertCircle, 
  Trash2, Sparkles, Building2, MapPin, Tag, Search
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { compressImagePreserveResolution, formatBytes } from '../lib/imageCompression';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  units: Unit[];
  stores: Store[];
  onSubmit: (data: any) => Promise<void>;
}

// Common Philippine Retail Sample Barcodes for Quick Testing
const DEMO_BARCODES = [
  { label: 'Lucky Me! Pancit Canton Kalamansi (80g)', barcode: '4800016099120', categorySlug: 'instant-noodles', defaultPrice: 15.00 },
  { label: 'Purefoods Corned Beef (150g)', barcode: '4800016644207', categorySlug: 'canned-goods', defaultPrice: 85.00 },
  { label: 'Mega Sardines in Tomato Sauce (155g)', barcode: '4800116010018', categorySlug: 'canned-goods', defaultPrice: 22.50 },
  { label: 'Datu Puti Vinegar (350ml)', barcode: '4800047820014', categorySlug: 'condiments', defaultPrice: 19.50 },
  { label: 'Silver Swan Soy Sauce (340ml)', barcode: '4800047820021', categorySlug: 'condiments', defaultPrice: 21.00 },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  units,
  stores,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [packageQty, setPackageQty] = useState(1);
  const [unitId, setUnitId] = useState(units[0]?.id || '');
  const [storeId, setStoreId] = useState(stores[0]?.id || '');
  const [price, setPrice] = useState(25.00);
  const [description, setDescription] = useState('');
  
  // Image handling
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeFileInputRef = useRef<HTMLInputElement>(null);

  // Barcode Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanSuccessBanner, setScanSuccessBanner] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Store search / filter
  const [storeSearch, setStoreSearch] = useState('');

  const [loading, setLoading] = useState(false);

  // Initialize defaults
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
    if (units.length > 0 && !unitId) {
      setUnitId(units[0].id);
    }
    if (stores.length > 0 && !storeId) {
      setStoreId(stores[0].id);
    }
  }, [categories, units, stores, categoryId, unitId, storeId]);

  // Cleanup scanner on modal close
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScanSuccessBanner(null);
      setScannerError(null);
    }
  }, [isOpen]);

  // Audio confirmation beep on successful barcode scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime); // Crisp 1760Hz beep
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  const handleBarcodeDetected = (code: string) => {
    playBeep();
    setBarcode(code.trim());
    setScanSuccessBanner(`✓ Barcode Captured: ${code.trim()}`);
    stopScanner();

    // Auto-match if it's in known Philippine sample commodities
    const matched = DEMO_BARCODES.find(d => d.barcode === code.trim());
    if (matched) {
      if (!name) setName(matched.label);
      if (matched.categorySlug) {
        const cat = categories.find(c => c.slug === matched.categorySlug);
        if (cat) setCategoryId(cat.id);
      }
      setPrice(matched.defaultPrice);
    }

    setTimeout(() => {
      setScanSuccessBanner(null);
    }, 4500);
  };

  // Start live camera barcode scanner
  const startScanner = async () => {
    setScannerError(null);
    setIsScanning(true);

    try {
      // Wait for DOM element to mount
      await new Promise(resolve => setTimeout(resolve, 250));
      const elementId = 'web-barcode-reader';
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Scanner container element not found.');
      }

      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(elementId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.6,
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Continuous frame parsing error - ignore
        }
      );
    } catch (err: any) {
      console.warn('Camera barcode scanner error:', err);
      setScannerError(err.message || 'Unable to access camera. Please allow camera permissions or test with demo barcodes below.');
      setIsScanning(false);
    }
  };

  // Stop camera barcode scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore
      } finally {
        html5QrCodeRef.current = null;
      }
    }
    setIsScanning(false);
  };

  // Scan barcode from uploaded image file
  const handleBarcodeFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('barcode-file-reader-dummy');
      const result = await html5QrCode.scanFile(file, true);
      handleBarcodeDetected(result);
    } catch (err: any) {
      alert(`Could not detect a clear barcode in this image: ${err.message || err}`);
    } finally {
      if (barcodeFileInputRef.current) barcodeFileInputRef.current.value = '';
    }
  };

  // Handle Product Image Upload with Full-Resolution Compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Image size exceeds 15MB. Please select a smaller photo.');
      return;
    }

    setImageFileName(file.name);

    try {
      // Compresses file payload by ~65-80% while strictly preserving full natural resolution
      const compressed = await compressImagePreserveResolution(file, 0.65);
      setImageFileSize(
        `${formatBytes(compressed.compressedSizeBytes)} (${compressed.compressionRatio}) • ${compressed.width}×${compressed.height}px (Full Res)`
      );
      setImagePreview(compressed.dataUrl);
      setImageUrl(compressed.dataUrl);
    } catch (err) {
      console.warn('Image compression fallback:', err);
      // Graceful fallback to FileReader
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
        setImageFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFileName('');
    setImageFileSize('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectDemoBarcode = (demo: typeof DEMO_BARCODES[0]) => {
    handleBarcodeDetected(demo.barcode);
    setName(demo.label);
    const cat = categories.find(c => c.slug === demo.categorySlug);
    if (cat) setCategoryId(cat.id);
    setPrice(demo.defaultPrice);
  };

  const selectedStore = stores.find(s => s.id === storeId);
  const filteredStores = stores.filter(s => {
    if (!storeSearch.trim()) return true;
    const q = storeSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.branch_name && s.branch_name.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.store_type && s.store_type.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      alert('Please enter or scan a valid product barcode.');
      return;
    }
    if (!storeId) {
      alert('Please select an initial store location.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name,
        barcode: barcode.trim(),
        category_id: categoryId,
        package_quantity: Number(packageQty),
        unit_id: unitId,
        initial_store_id: storeId,
        initial_price: Number(price),
        description,
        image_url: imagePreview || imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
        observation_date: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-outline-variant space-y-4 my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">Register New Product</h3>
              <p className="text-[11px] text-outline font-medium">Add to SaanMura catalog with barcode & store price baseline</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Success Notification Banner */}
        {scanSuccessBanner && (
          <div className="p-3 bg-secondary-fixed/25 border border-secondary/40 rounded-xl flex items-center gap-2.5 text-xs text-secondary animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-secondary" />
            <span className="font-bold">{scanSuccessBanner}</span>
          </div>
        )}

        {/* Scanner Error Notice */}
        {scannerError && (
          <div className="p-3 bg-tertiary-fixed/30 border border-tertiary/40 rounded-xl flex items-start gap-2.5 text-xs text-tertiary">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Camera scanner not available</p>
              <p className="text-[11px] opacity-90">{scannerError}</p>
            </div>
          </div>
        )}

        {/* Hidden element for file scanning */}
        <div id="barcode-file-reader-dummy" className="hidden" />

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Product Name */}
          <div>
            <label className="block font-bold text-on-surface mb-1">
              Product Name <span className="text-tertiary">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. San Miguel Corned Beef 175g"
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline/60 focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          {/* Barcode / SKU + Barcode Scanner Section */}
          <div className="space-y-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
            <div className="flex items-center justify-between">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5 text-primary" />
                Barcode / SKU <span className="text-tertiary">*</span>
              </label>

              {/* Barcode Action Buttons */}
              <div className="flex items-center gap-1.5">
                <input 
                  type="file" 
                  ref={barcodeFileInputRef} 
                  accept="image/*" 
                  onChange={handleBarcodeFileScan} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => barcodeFileInputRef.current?.click()}
                  title="Scan barcode from an image file"
                  className="px-2 py-1 text-[10px] font-bold rounded-lg border border-outline-variant/70 text-on-surface hover:bg-surface cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <ImageIcon className="w-3 h-3 text-outline" />
                  Scan Image
                </button>

                <button
                  type="button"
                  onClick={isScanning ? stopScanner : startScanner}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                    isScanning 
                      ? 'bg-tertiary text-white hover:bg-tertiary/90' 
                      : 'bg-primary-container text-on-primary-fixed hover:brightness-105 active:scale-95'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isScanning ? 'Close Scanner' : 'Scan Barcode'}
                </button>
              </div>
            </div>

            {/* Live Camera Viewfinder HUD */}
            {isScanning && (
              <div className="relative overflow-hidden rounded-xl border-2 border-primary bg-black/90 p-2 text-center space-y-2">
                <div className="relative mx-auto max-w-[320px] rounded-lg overflow-hidden bg-black">
                  <div id="web-barcode-reader" className="w-full aspect-[4/3]" />
                  {/* Targeting overlay frame */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-28 border-2 border-dashed border-primary-container/80 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary-container" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary-container" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary-container" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary-container" />
                      {/* Animated scan laser line */}
                      <div className="w-full h-0.5 bg-primary-container shadow-[0_0_8px_#ff9f43] animate-pulse my-14" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-white/80 font-medium">
                  Point camera at product barcode or retail QR code
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 4800016099120"
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-mono font-semibold tracking-wider text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
              />

              {/* Category Dropdown */}
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface cursor-pointer text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Demo Barcodes for instant testing */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-outline font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Test Barcodes:
              </span>
              {DEMO_BARCODES.map((d) => (
                <button
                  key={d.barcode}
                  type="button"
                  onClick={() => handleSelectDemoBarcode(d)}
                  className="px-2 py-0.5 rounded-md bg-surface border border-outline-variant/50 hover:border-primary text-[10px] font-mono text-on-surface cursor-pointer transition-colors"
                  title={`Fill with ${d.label} (${d.barcode})`}
                >
                  {d.barcode.slice(-5)} ({d.label.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Package Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">Package Quantity</label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={packageQty}
                onChange={(e) => setPackageQty(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Unit of Measurement</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface cursor-pointer text-xs"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Store & Observed Price Section */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <StoreIcon className="w-3.5 h-3.5 text-primary" />
                Select Initial Store <span className="text-tertiary">*</span>
              </label>
              <span className="text-[10px] text-outline font-medium">
                {stores.length} registered locations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1.5">
                {stores.length > 3 && (
                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2.5 top-2 text-outline" />
                    <input
                      type="text"
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      placeholder="Filter store or city..."
                      className="w-full py-1.5 pl-7 pr-2 rounded-md border border-outline-variant/60 bg-surface text-[11px] text-on-surface focus:border-primary outline-hidden"
                    />
                  </div>
                )}
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface cursor-pointer text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
                >
                  {filteredStores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.branch_name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-outline">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="Observed Price"
                    className="w-full p-2.5 pl-7 rounded-lg border border-outline-variant bg-surface text-on-surface font-headline font-bold text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Selected Store Metadata Preview Card */}
            {selectedStore && (
              <div className="mt-2 p-2.5 rounded-lg bg-surface border border-outline-variant/40 flex items-start justify-between text-[11px]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-on-surface">{selectedStore.name} — {selectedStore.branch_name}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                      {selectedStore.store_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-outline text-[10px]">
                    <MapPin className="w-3 h-3 text-outline" />
                    <span>{selectedStore.address}, {selectedStore.city}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-secondary-fixed/30 text-secondary text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Store
                </span>
              </div>
            )}
          </div>

          {/* Product Image Section (Upload & URL) */}
          <div className="space-y-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
            <div className="flex items-center justify-between">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                Product Image
              </label>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    imageInputMode === 'upload' ? 'bg-primary-container text-on-primary-fixed shadow-xs' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    imageInputMode === 'url' ? 'bg-primary-container text-on-primary-fixed shadow-xs' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  /* Image Preview Card */
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-outline-variant/80">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-16 h-16 rounded-lg object-cover border border-outline-variant/60 shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface truncate text-xs">{imageFileName || 'Uploaded Product Photo'}</p>
                      <p className="text-[10px] text-outline">{imageFileSize || 'Ready for catalog baseline'}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          Replace Photo
                        </button>
                        <span className="text-outline/40">•</span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-[10px] font-bold text-tertiary hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Dropzone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant/80 hover:border-primary rounded-xl p-4 text-center bg-surface hover:bg-surface-container-high/40 cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-xs">
                        Click to upload product photo or drag & drop
                      </p>
                      <p className="text-[10px] text-outline">
                        PNG, JPG, WebP up to 8MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface text-on-surface text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Description / Specification */}
          <div>
            <label className="block font-bold text-on-surface mb-1">Description / Specification</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Commodity details, packaging type, net weight, ingredients..."
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-hidden"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-fixed text-xs font-bold shadow-md hover:brightness-105 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Tag className="w-3.5 h-3.5" />
                  <span>Submit to Queue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
