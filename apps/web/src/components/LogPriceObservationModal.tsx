import React, { useState, useEffect, useRef } from 'react';
import type { Product, Store } from '@saanmura/shared-types';
import { formatPeso, evaluateSrpStatus } from '@saanmura/domain';
import { 
  X, Store as StoreIcon, Camera, Calendar, ArrowRight, 
  TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Shield,
  UploadCloud, Trash2, RefreshCw, Link as LinkIcon
} from 'lucide-react';
import { compressImagePreserveResolution, formatBytes } from '../lib/imageCompression';

interface LogPriceObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  availableProducts?: Product[];
  stores: Store[];
  onSubmit: (data: {
    productId: string;
    storeId: string;
    observedPrice: number;
    observationDate: string;
    evidenceImageUrl?: string;
    remarks?: string;
  }) => Promise<void>;
}

export const LogPriceObservationModal: React.FC<LogPriceObservationModalProps> = ({
  isOpen,
  onClose,
  product: initialProduct,
  availableProducts = [],
  stores,
  onSubmit,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);
  const [storeId, setStoreId] = useState<string>('');
  const [storeSearch, setStoreSearch] = useState<string>('');
  const [observedPrice, setObservedPrice] = useState<string>('');
  const [observationDate, setObservationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Evidence Photo State (Camera & File Upload)
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState<string>('');
  const [evidenceFileSize, setEvidenceFileSize] = useState<string>('');
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUrlFallback, setShowUrlFallback] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');

  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Refs for camera and file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync initial product when opened
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      if (initialProduct.lowest_verified_price) {
        setObservedPrice(initialProduct.lowest_verified_price.toString());
      }
    } else if (availableProducts.length > 0) {
      setSelectedProduct(availableProducts[0]);
      if (availableProducts[0].lowest_verified_price) {
        setObservedPrice(availableProducts[0].lowest_verified_price.toString());
      }
    }
    if (stores.length > 0 && !storeId) {
      setStoreId(stores[0].id);
    }
    setErrorMsg(null);
  }, [isOpen, initialProduct, availableProducts, stores]);

  // Clean up camera stream on close / unmount
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [isOpen]);

  if (!isOpen || !selectedProduct) return null;

  const currentVerifiedPrice = selectedProduct.lowest_verified_price || 0;
  const numObservedPrice = parseFloat(observedPrice) || 0;
  const priceDiff = Number((numObservedPrice - currentVerifiedPrice).toFixed(2));
  const pctChange = currentVerifiedPrice > 0 ? Number(((priceDiff / currentVerifiedPrice) * 100).toFixed(2)) : 0;
  const isDrop = priceDiff < 0;
  const isRaise = priceDiff > 0;

  const srpEval = evaluateSrpStatus(numObservedPrice, selectedProduct.srp_price);

  const filteredStores = stores.filter((s) => {
    if (!storeSearch.trim()) return true;
    const q = storeSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      (s.branch_name && s.branch_name.toLowerCase().includes(q))
    );
  });

  // Handle File from Device or Camera input with Full-Resolution Compression
  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, etc.).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Image file size exceeds 15MB. Please select a smaller photo.');
      return;
    }

    setEvidenceFileName(file.name);

    try {
      // Compresses payload by ~65-80% without reducing native pixel resolution
      const compressed = await compressImagePreserveResolution(file, 0.65);
      setEvidenceFileSize(
        `${formatBytes(compressed.compressedSizeBytes)} (${compressed.compressionRatio}) • ${compressed.width}×${compressed.height}px (Full Res)`
      );
      setEvidencePreview(compressed.dataUrl);
    } catch (err) {
      console.warn('Compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setEvidencePreview(dataUrl);
        setEvidenceFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input so same file can be re-selected if replaced
    e.target.value = '';
  };

  // Live Camera handlers (Webcam or phone back-camera stream)
  const handleStartLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsLiveCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      // Fallback: If browser blocks live media or no webcam, trigger native camera input
      cameraInputRef.current?.click();
    }
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Compress with 0.65 JPEG quality while keeping exact video stream resolution
      const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
      const base64Data = dataUrl.split(',')[1] || dataUrl;
      const compressedSize = Math.round((base64Data.length * 3) / 4);
      setEvidencePreview(dataUrl);
      setEvidenceFileName(`Camera_Evidence_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.jpg`);
      setEvidenceFileSize(`${formatBytes(compressedSize)} (Compressed) • ${canvas.width}×${canvas.height}px (Full Res)`);
    }
    stopLiveCamera();
  };

  const handleRemoveEvidence = () => {
    setEvidencePreview(null);
    setEvidenceFileName('');
    setEvidenceFileSize('');
    setUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) {
      setErrorMsg('Please select the store where this price was observed.');
      return;
    }
    if (numObservedPrice <= 0) {
      setErrorMsg('Please enter a valid price greater than ₱0.00.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await onSubmit({
        productId: selectedProduct.id,
        storeId,
        observedPrice: numObservedPrice,
        observationDate,
        evidenceImageUrl: evidencePreview || undefined,
        remarks: remarks.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to submit price observation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Sample quick evidence presets
  const sampleEvidencePresets = [
    { label: 'Official POS Receipt', url: 'https://images.unsplash.com/photo-1554415707-9e49fe0488b1?auto=format&fit=crop&w=400&q=80' },
    { label: 'Clear Shelf Tag', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Hidden File Inputs for Native Camera and Device Files */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">price_change</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-on-surface">
                Log New Store Price
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                Record an observed shelf price observation for this existing commodity.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-tertiary-container/30 border border-tertiary/40 text-tertiary text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Locked Current Commodity Banner */}
        <div className="p-3.5 bg-surface-container-low/70 rounded-xl border border-outline-variant/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-surface-container-lowest border border-outline-variant/40 p-1 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'}
                alt={selectedProduct.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-headline font-bold text-xs text-on-surface truncate block">
                {selectedProduct.name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5 flex-wrap">
                <span className="font-mono bg-surface-container px-1 py-0.2 rounded border border-outline-variant/40">
                  {selectedProduct.barcode}
                </span>
                <span>•</span>
                <span>{selectedProduct.package_quantity} {selectedProduct.unit?.abbreviation || 'g'}</span>
                <span>•</span>
                <span className="font-semibold text-primary">{selectedProduct.category?.name || 'Commodity'}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 pl-2 border-l border-outline-variant/40">
            <span className="text-[9px] uppercase font-bold text-outline block">Last Verified</span>
            <span className="font-headline text-sm font-extrabold text-on-surface">
              {formatPeso(currentVerifiedPrice)}
            </span>
            {selectedProduct.srp_price && (
              <span className="text-[9px] text-secondary font-semibold block">
                SRP: {formatPeso(selectedProduct.srp_price)}
              </span>
            )}
          </div>
        </div>

        {/* Form Fields: Store, Price, Date, Evidence, Remarks */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Store Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-on-surface flex items-center gap-1">
                <StoreIcon className="w-3.5 h-3.5 text-primary" />
                <span>Purchased At Store / Retailer</span>
                <span className="text-tertiary">*</span>
              </label>
              <span className="text-[10px] text-outline">
                {stores.length} monitored retail stores
              </span>
            </div>

            {/* Quick search input */}
            {stores.length > 5 && (
              <div className="mb-1.5">
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Filter store by name or city..."
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-outline-variant/50 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                />
              </div>
            )}

            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-semibold focus:border-primary outline-hidden cursor-pointer"
            >
              {filteredStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.branch_name ? `(${s.branch_name}, ${s.city})` : `(${s.city})`}
                </option>
              ))}
            </select>
          </div>

          {/* Observed Price & Differential */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div>
              <label className="block font-bold text-on-surface mb-1">
                Observed Shelf Price (₱) <span className="text-tertiary">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={observedPrice}
                  onChange={(e) => setObservedPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary outline-hidden"
                />
              </div>
            </div>

            {/* Observation Date */}
            <div>
              <label className="block font-bold text-on-surface mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Observation Date</span> <span className="text-tertiary">*</span>
              </label>
              <input
                type="date"
                required
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary outline-hidden"
              />
            </div>
          </div>

          {/* Real-Time Price Differential Telemetry Callout */}
          {numObservedPrice > 0 && (
            <div className="p-3 rounded-xl bg-surface-container-low/80 border border-outline-variant/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block">Previous Price</span>
                  <span className="font-headline font-bold text-on-surface-variant line-through">
                    {formatPeso(currentVerifiedPrice)}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-outline" />

                <div>
                  <span className="text-[10px] text-primary font-bold uppercase block">Observed Price</span>
                  <span className="font-headline text-base font-extrabold text-on-surface">
                    {formatPeso(numObservedPrice)}
                  </span>
                </div>
              </div>

              {/* Delta Badge */}
              <div className="text-right">
                {isDrop && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-secondary font-bold text-[11px]">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>▼ {formatPeso(Math.abs(priceDiff))} ({pctChange}%)</span>
                  </span>
                )}
                {isRaise && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>▲ +{formatPeso(priceDiff)} (+{pctChange}%)</span>
                  </span>
                )}
                {!isDrop && !isRaise && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-surface-container text-outline font-bold text-[11px]">
                    Exact Match (₱0.00)
                  </span>
                )}

                {selectedProduct.srp_price && (
                  <span className="block text-[10px] text-outline mt-0.5">
                    {srpEval.badgeLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ================= EVIDENCE PHOTO SECTION (CAPTURE OR UPLOAD) ================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-on-surface flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Evidence Photo (Shelf Tag or POS Receipt)</span>
                <span className="text-[10px] text-outline font-normal">(Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUrlFallback(!showUrlFallback)}
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <LinkIcon className="w-2.5 h-2.5" />
                <span>{showUrlFallback ? 'Hide URL input' : 'Paste URL instead'}</span>
              </button>
            </div>

            {/* Live Camera Viewfinder Mode */}
            {isLiveCameraActive ? (
              <div className="rounded-xl border-2 border-primary overflow-hidden bg-black relative p-2 flex flex-col items-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-56 object-cover rounded-lg"
                />
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handleCaptureFromCamera}
                    className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="px-3 py-2 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : evidencePreview ? (
              /* Photo Preview Card */
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-surface-container-lowest border border-outline-variant/40 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={evidencePreview}
                    alt="Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-xs truncate">
                    {evidenceFileName || 'Evidence Photo Attached'}
                  </p>
                  <p className="text-[10px] text-outline">
                    {evidenceFileSize || 'Ready for audit inspection'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Retake Photo
                    </button>
                    <span className="text-outline/40">•</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UploadCloud className="w-3 h-3" /> Replace File
                    </button>
                    <span className="text-outline/40">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveEvidence}
                      className="text-[10px] font-bold text-tertiary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Dual Action: Capture from Phone Camera OR Upload File from Device */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                  isDragging
                    ? 'border-primary bg-primary-fixed/20'
                    : 'border-outline-variant/70 hover:border-primary/80 bg-surface-container-lowest hover:bg-surface-container-low/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
                  {/* Action 1: Capture with Phone / Device Camera */}
                  <button
                    type="button"
                    onClick={handleStartLiveCamera}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary-container text-on-primary-fixed font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:brightness-105 active:scale-95 cursor-pointer"
                    title="Open device camera or webcam to take a photo"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  <span className="text-[11px] text-outline font-medium">or</span>

                  {/* Action 2: Choose File from Device */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-outline-variant bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-high active:scale-95 cursor-pointer"
                    title="Upload photo from photo gallery or files"
                  >
                    <UploadCloud className="w-4 h-4 text-primary" />
                    <span>Upload Image</span>
                  </button>
                </div>

                <p className="text-[10px] text-outline">
                  Drag and drop photo here, or select from phone camera / file gallery (PNG, JPG, WebP up to 10MB)
                </p>
              </div>
            )}

            {/* Collapsible URL Input fallback */}
            {showUrlFallback && !evidencePreview && (
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 space-y-2 mt-2">
                <label className="block text-[11px] font-semibold text-on-surface">
                  Or Paste External Photo URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://... photo url"
                    className="flex-1 p-2 rounded-lg border border-outline-variant bg-surface text-xs focus:border-primary outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput.trim()) {
                        setEvidencePreview(urlInput.trim());
                        setEvidenceFileName('External Photo URL');
                        setEvidenceFileSize('Linked URL');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high cursor-pointer"
                  >
                    Attach
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-outline">Presets:</span>
                  {sampleEvidencePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setEvidencePreview(preset.url);
                        setEvidenceFileName(preset.label);
                        setEvidenceFileSize('Preset Photo');
                      }}
                      className="px-2 py-0.5 rounded-md bg-surface-container text-primary text-[10px] font-semibold hover:bg-surface-container-high transition-all cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold text-on-surface mb-1">
              Contributor Remarks / Observations
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Promo tag valid until Sunday; special bundle packaging on aisle 3..."
              className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface resize-none focus:border-primary outline-hidden"
            />
          </div>

          {/* Civic Governance Disclaimer */}
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center gap-2 text-[10px] text-on-surface-variant">
            <Shield className="w-4 h-4 text-secondary shrink-0" />
            <span>
              This observation will be submitted directly to the <strong>Verification Queue</strong> under the Civic Quorum protocol. The historical price log remains preserved.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || numObservedPrice <= 0}
              className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-fixed text-xs font-bold shadow-md hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting to Queue...' : 'Submit Price Observation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
