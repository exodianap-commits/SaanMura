import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { Store, StoreTypeItem } from '@saanmura/shared-types';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Crosshair, CheckCircle2, AlertCircle, 
  Store as StoreIcon, Sparkles, X, Loader2,
  Camera, UploadCloud, Trash2, RefreshCw, Link as LinkIcon
} from 'lucide-react';

// Fix Leaflet default icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom component to pan main map to selected store
const ChangeMapView: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14, { animate: true });
  }, [coords, map]);
  return null;
};

// Interactive Pin Placement & Dragging Component for the Modal Map
const ModalLocationPicker: React.FC<{
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}> = ({ position, onChange }) => {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.panTo(e.latlng);
    },
  });

  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onChange]
  );

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>
        <div className="text-center font-sans text-xs">
          <span className="font-bold text-[#111c2d] block">Selected Store Pin</span>
          <span className="text-[10px] text-[#544437]">Drag or click map to reposition</span>
        </div>
      </Popup>
    </Marker>
  );
};

// Quick Philippine Commercial Presets
const PRESET_LOCATIONS = [
  { name: 'Nepa Q-Mart (QC)', lat: '14.6288', lng: '121.0505', city: 'Quezon City', address: 'EDSA Cubao, Quezon City' },
  { name: 'Puregold Paso de Blas', lat: '14.6975', lng: '120.9850', city: 'Valenzuela City', address: 'Paso de Blas Rd, Malinta' },
  { name: 'SM Megamall', lat: '14.5846', lng: '121.0567', city: 'Mandaluyong City', address: 'EDSA cor. Doña Julia Vargas Ave' },
  { name: 'Agora Market (San Juan)', lat: '14.6033', lng: '121.0285', city: 'San Juan City', address: 'N. Domingo St, San Juan City' },
  { name: 'Divisoria Complex', lat: '14.6037', lng: '120.9702', city: 'City of Manila', address: 'Claro M. Recto Ave, Tondo' },
  { name: 'Commonwealth Market', lat: '14.6967', lng: '121.0872', city: 'Quezon City', address: 'Commonwealth Ave, Quezon City' },
];

interface StoreRegistryViewProps {
  stores: Store[];
  storeTypes?: StoreTypeItem[];
  onAddStore: (store: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateStore?: (id: string, updates: Partial<Store>) => Promise<void>;
}

export const StoreRegistryView: React.FC<StoreRegistryViewProps> = ({ 
  stores, 
  storeTypes = [], 
  onAddStore,
  onUpdateStore,
}) => {
  const [selectedStore, setSelectedStore] = useState<Store>(stores[0] || null);
  const [storeFilter, setStoreFilter] = useState<'all' | 'supermarket' | 'wet_market'>('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Form fields for Add/Edit Store
  const [newName, setNewName] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newType, setNewType] = useState<any>('supermarket');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Quezon City');
  const [newLat, setNewLat] = useState('14.6500');
  const [newLng, setNewLng] = useState('121.0300');

  // Storefront Photo & Camera State
  const [storeImagePreview, setStoreImagePreview] = useState<string | null>(null);
  const [storeImageFileName, setStoreImageFileName] = useState<string>('');
  const [storeImageFileSize, setStoreImageFileSize] = useState<string>('');
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUrlFallback, setShowUrlFallback] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');

  const storeFileInputRef = useRef<HTMLInputElement>(null);
  const storeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera helper
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  useEffect(() => {
    if (!isAddModalOpen) {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [isAddModalOpen]);

  // GPS Location state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filtered = stores.filter((s) => {
    const matchesType = storeFilter === 'all' || s.store_type === storeFilter;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.branch_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Handle Current Location via Browser GPS
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoFeedback({
        type: 'error',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setGeoLoading(true);
    setGeoFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        setNewLat(lat.toString());
        setNewLng(lng.toString());
        setGeoLoading(false);
        setGeoFeedback({
          type: 'success',
          message: `GPS Location acquired (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`,
        });

        // Reverse geocoding attempt using OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const road = data.address.road || data.address.suburb || data.address.neighbourhood;
              const city = data.address.city || data.address.town || data.address.municipality;
              if (road && (!newAddress || newAddress.includes('North Ave'))) {
                setNewAddress(road);
              }
              if (city) {
                setNewCity(city);
              }
            }
          }
        } catch {
          // Reverse geocoding fail fallback
        }

        setTimeout(() => setGeoFeedback(null), 5000);
      },
      (err) => {
        setGeoLoading(false);
        setGeoFeedback({
          type: 'error',
          message: `GPS error: ${err.message}. You can click anywhere on the map to pin manually.`,
        });
        setTimeout(() => setGeoFeedback(null), 6000);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Handle map pin click or drag
  const handleMapPinChange = (lat: number, lng: number) => {
    setNewLat(lat.toFixed(5));
    setNewLng(lng.toFixed(5));
    setGeoFeedback({
      type: 'success',
      message: `Pin updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
    setTimeout(() => setGeoFeedback(null), 3000);
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setNewLat(preset.lat);
    setNewLng(preset.lng);
    setNewCity(preset.city);
    if (!newAddress) setNewAddress(preset.address);
    setGeoFeedback({
      type: 'success',
      message: `Location set to ${preset.name}`,
    });
    setTimeout(() => setGeoFeedback(null), 3000);
  };

  // Image processing handlers
  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, etc.).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size exceeds 10MB.');
      return;
    }

    setStoreImageFileName(file.name);
    setStoreImageFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setStoreImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
    e.target.value = '';
  };

  const handleStartLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
      storeCameraInputRef.current?.click();
    }
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setStoreImagePreview(dataUrl);
      setStoreImageFileName(`Store_Snap_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.jpg`);
      setStoreImageFileSize('Camera Snapshot');
    }
    stopLiveCamera();
  };

  const handleRemoveImage = () => {
    setStoreImagePreview(null);
    setStoreImageFileName('');
    setStoreImageFileSize('');
    setUrlInput('');
  };

  const handleOpenAddStore = () => {
    setEditingStore(null);
    setNewName('');
    setNewBranch('');
    setNewType('supermarket');
    setNewAddress('');
    setNewCity('Quezon City');
    setNewLat('14.6500');
    setNewLng('121.0300');
    setStoreImagePreview(null);
    setStoreImageFileName('');
    setStoreImageFileSize('');
    setUrlInput('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditStore = (store: Store) => {
    setEditingStore(store);
    setNewName(store.name);
    setNewBranch(store.branch_name || '');
    setNewType(store.store_type);
    setNewAddress(store.address);
    setNewCity(store.city);
    setNewLat(store.latitude.toString());
    setNewLng(store.longitude.toString());
    setStoreImagePreview(store.image_url || null);
    setStoreImageFileName(store.image_url ? 'Current Storefront Photo' : '');
    setStoreImageFileSize('');
    setUrlInput('');
    setIsAddModalOpen(true);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress) return;
    try {
      if (editingStore && onUpdateStore) {
        await onUpdateStore(editingStore.id, {
          name: newName,
          branch_name: newBranch,
          store_type: newType,
          address: newAddress,
          city: newCity,
          latitude: parseFloat(newLat) || 14.65,
          longitude: parseFloat(newLng) || 121.03,
          image_url: storeImagePreview || undefined,
        });
      } else {
        await onAddStore({
          name: newName,
          branch_name: newBranch,
          store_type: newType,
          address: newAddress,
          city: newCity,
          province: 'Metro Manila',
          latitude: parseFloat(newLat) || 14.65,
          longitude: parseFloat(newLng) || 121.03,
          is_verified: true,
          image_url: storeImagePreview || undefined,
        });
      }
      setIsAddModalOpen(false);
      setEditingStore(null);
      setNewName('');
      setNewBranch('');
      setNewAddress('');
      setStoreImagePreview(null);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const modalCoords: [number, number] = [
    parseFloat(newLat) || 14.65,
    parseFloat(newLng) || 121.03,
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-outline-variant/60 gap-3">
        <div>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            Store Registry & Interactive Geolocation
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Geographic mapping of Philippine supermarkets, public wet markets (palengke), and municipal trading hubs.
          </p>
        </div>

        <button
          onClick={handleOpenAddStore}
          className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed font-bold text-xs flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add_location</span>
          <span>Add Verified Store</span>
        </button>
      </div>

      {/* Main Split: Directory on Left, Leaflet Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[600px]">
        {/* Left Directory (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs flex flex-col h-full overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-outline-variant/30 space-y-2 bg-surface-container-low/40">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search market, branch, or city..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-outline-variant/60 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStoreFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  storeFilter === 'all'
                    ? 'bg-primary-container text-on-primary-fixed font-bold'
                    : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'
                }`}
              >
                All ({stores.length})
              </button>
              <button
                onClick={() => setStoreFilter('supermarket')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  storeFilter === 'supermarket'
                    ? 'bg-primary-container text-on-primary-fixed font-bold'
                    : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'
                }`}
              >
                Supermarkets
              </button>
              <button
                onClick={() => setStoreFilter('wet_market')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  storeFilter === 'wet_market'
                    ? 'bg-primary-container text-on-primary-fixed font-bold'
                    : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'
                }`}
              >
                Wet Markets (Palengke)
              </button>
            </div>
          </div>

          {/* Scrollable Store List */}
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/20 p-2 space-y-1.5">
            {filtered.map((store) => {
              const isSelected = selectedStore?.id === store.id;
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary-fixed/25 border-primary-container shadow-xs'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {store.image_url ? (
                        <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/40">
                          <img
                            src={store.image_url}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                          <StoreIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-on-surface truncate block">
                          {store.name} {store.branch_name ? `- ${store.branch_name}` : ''}
                        </span>
                        <span className="text-[11px] text-on-surface-variant truncate block mt-0.5">
                          {store.address}, {store.city}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                        store.store_type === 'wet_market'
                          ? 'bg-secondary-fixed text-secondary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {store.store_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-outline mt-1 font-mono">
                    <span>
                      {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-secondary font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">verified</span> Verified
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditStore(store);
                        }}
                        className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[10px] cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Map Canvas (7 cols) - Isolated stacking context to prevent Leaflet from bleeding into modals */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs overflow-hidden relative isolate z-0">
          <MapContainer
            center={
              selectedStore
                ? [selectedStore.latitude, selectedStore.longitude]
                : [14.6091, 121.0223]
            }
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selectedStore && (
              <ChangeMapView coords={[selectedStore.latitude, selectedStore.longitude]} />
            )}

            {filtered.map((s) => (
              <Marker
                key={s.id}
                position={[s.latitude, s.longitude]}
                eventHandlers={{
                  click: () => setSelectedStore(s),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 font-sans max-w-[200px]">
                    {s.image_url && (
                      <div className="w-full h-24 rounded-lg overflow-hidden mb-1 border border-outline-variant/30">
                        <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="font-bold text-xs text-[#111c2d] block truncate">
                      {s.name} {s.branch_name ? `- ${s.branch_name}` : ''}
                    </span>
                    <span className="text-[10px] text-[#544437] block line-clamp-2">{s.address}</span>
                    <span className="text-[9px] font-mono text-[#877365] block">
                      Lat: {s.latitude.toFixed(4)}, Lng: {s.longitude.toFixed(4)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Add Store Modal - Highest z-index above all Leaflet layers */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Hidden File Inputs for Native Phone Camera and Device Gallery */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={storeCameraInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={storeFileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-outline-variant space-y-4 my-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">add_location</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    {editingStore ? 'Edit Store & Classification' : 'Add New Monitored Store'}
                  </h3>
                  <p className="text-[11px] text-outline font-medium">
                    {editingStore ? 'Update retail channel taxonomy, address, or location coordinates' : 'Pin exact GPS location or use current device location'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Feedback Banner */}
            {geoFeedback && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200 ${
                geoFeedback.type === 'success' 
                  ? 'bg-secondary-fixed/30 border-secondary/40 text-secondary font-bold' 
                  : 'bg-tertiary-fixed/30 border-tertiary/40 text-tertiary'
              }`}>
                {geoFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{geoFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateStore} className="space-y-3.5 text-xs">
              
              {/* Store & Branch Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-on-surface mb-1">
                    Store / Market Name <span className="text-tertiary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Puregold, Commonwealth Market"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Branch / Section</label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    placeholder="e.g. Paso de Blas or Meat Section"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              {/* Store Type & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Store Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface cursor-pointer focus:border-primary outline-hidden"
                  >
                    {(storeTypes && storeTypes.length > 0 ? storeTypes : [
                      { slug: 'supermarket', name: 'Supermarket' },
                      { slug: 'wet_market', name: 'Wet Market (Palengke)' },
                      { slug: 'grocery', name: 'Grocery / Minimart' },
                      { slug: 'convenience', name: 'Convenience Store' },
                      { slug: 'wholesale', name: 'Wholesale Trading Center' },
                      { slug: 'kadiwa', name: 'Kadiwa Center' },
                    ]).map((st) => (
                      <option key={st.slug} value={st.slug}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">City / Municipality</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Quezon City, Valenzuela"
                    className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              {/* Storefront / Market Photo Section */}
              <div className="space-y-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-on-surface flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-primary" />
                    <span>Storefront / Market Photo</span>
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
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex items-center gap-3 mt-2.5">
                      <button
                        type="button"
                        onClick={handleCaptureFromCamera}
                        className="px-4 py-1.5 rounded-xl bg-secondary text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : storeImagePreview ? (
                  /* Photo Preview Card */
                  <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/50 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-surface-container-low border border-outline-variant/40 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={storeImagePreview}
                        alt="Storefront Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface text-xs truncate">
                        {storeImageFileName || 'Storefront Photo Attached'}
                      </p>
                      <p className="text-[10px] text-outline">
                        {storeImageFileSize || 'Ready for store directory'}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1">
                        <button
                          type="button"
                          onClick={() => storeCameraInputRef.current?.click()}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Retake Photo
                        </button>
                        <span className="text-outline/40">•</span>
                        <button
                          type="button"
                          onClick={() => storeFileInputRef.current?.click()}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <UploadCloud className="w-3 h-3" /> Replace
                        </button>
                        <span className="text-outline/40">•</span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-[10px] font-bold text-tertiary hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Capture or Upload Dropzone */
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
                    className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all ${
                      isDragging
                        ? 'border-primary bg-primary-fixed/20'
                        : 'border-outline-variant/70 hover:border-primary/80 bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={handleStartLiveCamera}
                        className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-fixed font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:brightness-105 active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Store Photo</span>
                      </button>

                      <span className="text-[10px] text-outline font-medium">or</span>

                      <button
                        type="button"
                        onClick={() => storeFileInputRef.current?.click()}
                        className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-high active:scale-95 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-primary" />
                        <span>Upload Image</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-outline">
                      PNG, JPG, WebP up to 10MB (Storefront facade, market signage, or entrance)
                    </p>
                  </div>
                )}

                {/* Collapsible URL Input fallback */}
                {showUrlFallback && !storeImagePreview && (
                  <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/50 space-y-1.5 mt-1.5">
                    <label className="block text-[11px] font-semibold text-on-surface">
                      Or Paste Image URL / Presets:
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
                            setStoreImagePreview(urlInput.trim());
                            setStoreImageFileName('External Store Photo');
                            setStoreImageFileSize('Linked URL');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high cursor-pointer"
                      >
                        Attach
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[10px] text-outline">Presets:</span>
                      {[
                        { label: 'Supermarket', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80' },
                        { label: 'Palengke Stall', url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80' },
                        { label: 'Minimart', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setStoreImagePreview(preset.url);
                            setStoreImageFileName(preset.label);
                            setStoreImageFileSize('Preset Photo');
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

              {/* Interactive Map Pinning & GPS Location Section */}
              <div className="space-y-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <span className="font-bold text-on-surface block">Pin Location on Map</span>
                      <span className="text-[10px] text-outline">Click map or drag the blue marker to refine</span>
                    </div>
                  </div>

                  {/* GPS Locator Button */}
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={geoLoading}
                    className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed font-bold text-xs shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
                    title="Get location from device GPS"
                  >
                    {geoLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Interactive Leaflet Mini-Map inside the Modal */}
                <div className="h-44 w-full rounded-xl overflow-hidden border border-outline-variant relative isolate z-0">
                  <MapContainer
                    center={modalCoords}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ModalLocationPicker
                      position={modalCoords}
                      onChange={handleMapPinChange}
                    />
                  </MapContainer>
                </div>

                {/* Quick Trading Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-outline font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Quick Presets:
                  </span>
                  {PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="px-2 py-0.5 rounded-md bg-surface border border-outline-variant/50 hover:border-primary text-[10px] text-on-surface cursor-pointer transition-colors"
                      title={`Jump to ${preset.name}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Street Address <span className="text-tertiary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. EDSA cor. North Ave, Diliman"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary outline-hidden"
                />
              </div>

              {/* Exact Coordinates (Auto-synced with pin) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-on-surface mb-1 text-[11px]">Latitude</label>
                  <input
                    type="text"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full p-2 rounded-lg border border-outline-variant bg-surface font-mono text-xs focus:border-primary outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1 text-[11px]">Longitude</label>
                  <input
                    type="text"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full p-2 rounded-lg border border-outline-variant bg-surface font-mono text-xs focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-fixed text-xs font-bold shadow-md hover:brightness-105 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <StoreIcon className="w-3.5 h-3.5" />
                  {editingStore ? 'Update Store' : 'Save Verified Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
