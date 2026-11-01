import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import type { 
  Product, Store, PriceSubmission, ProductSubmission, StoreChangeSubmission, 
  ExternalReferencePrice, Profile, AuditLog, VerificationStats, UserRoleType, StoreTypeItem, Category 
} from '@saanmura/shared-types';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';
import { VerificationQueueView } from './views/VerificationQueueView';
import { CatalogDiscoveryView } from './views/CatalogDiscoveryView';
import { AdminControlCenterView } from './views/AdminControlCenterView';
import { StoreRegistryView } from './views/StoreRegistryView';
import { UserManagementView } from './views/UserManagementView';
import { DtiReferenceView } from './views/DtiReferenceView';
import { AuditLogsView } from './views/AuditLogsView';
import { LoginView } from './views/LoginView';
import { AddProductModal } from './components/AddProductModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LogPriceObservationModal } from './components/LogPriceObservationModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);

  // Data state
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeTypes, setStoreTypes] = useState<StoreTypeItem[]>([]);
  const [priceSubmissions, setPriceSubmissions] = useState<PriceSubmission[]>([]);
  const [productSubmissions, setProductSubmissions] = useState<ProductSubmission[]>([]);
  const [storeSubmissions, setStoreSubmissions] = useState<StoreChangeSubmission[]>([]);
  const [references, setReferences] = useState<ExternalReferencePrice[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isLogPriceOpen, setIsLogPriceOpen] = useState(false);
  const [productForPriceObservation, setProductForPriceObservation] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Load initial data
  const loadAllData = async () => {
    try {
      const [
        fetchedStats,
        fetchedProducts,
        fetchedCategories,
        fetchedStores,
        fetchedStoreTypes,
        fetchedPriceSubs,
        fetchedProdSubs,
        fetchedStoreSubs,
        fetchedRefs,
        fetchedProfiles,
        fetchedLogs,
      ] = await Promise.all([
        api.getStats(),
        api.getProducts(),
        api.getCategories(),
        api.getStores(),
        api.getStoreTypes(),
        api.getPriceSubmissions('all'),
        api.getProductSubmissions('all'),
        api.getStoreSubmissions('all'),
        api.getReferencePrices(),
        api.getProfiles(),
        api.getAuditLogs(),
      ]);

      setStats(fetchedStats);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setStores(fetchedStores);
      setStoreTypes(fetchedStoreTypes);
      setPriceSubmissions(fetchedPriceSubs);
      setProductSubmissions(fetchedProdSubs);
      setStoreSubmissions(fetchedStoreSubs);
      setReferences(fetchedRefs);
      setProfiles(fetchedProfiles);
      setAuditLogs(fetchedLogs);

      if (!currentUser) {
        // Default to admin user for instant review
        const adminUser = fetchedProfiles.find((p) => p.role === 'admin') || fetchedProfiles[0];
        setCurrentUser(adminUser);
      }
    } catch (err) {
      console.error('Error loading SaanMura data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Verification Handlers
  const handleApprovePrice = async (submissionId: string, remarks?: string) => {
    if (!currentUser) return;
    await api.approvePriceSubmission(submissionId, currentUser.id, remarks);
    await loadAllData();
  };

  const handleRejectPrice = async (submissionId: string, reason: string) => {
    if (!currentUser) return;
    await api.rejectPriceSubmission(submissionId, currentUser.id, reason);
    await loadAllData();
  };

  const handleRequestClarification = async (submissionId: string, remarks: string) => {
    if (!currentUser) return;
    await api.requestPriceClarification(submissionId, currentUser.id, remarks);
    await loadAllData();
  };

  const handleApproveProduct = async (submissionId: string) => {
    if (!currentUser) return;
    await api.approveProductSubmission(submissionId, currentUser.id);
    await loadAllData();
  };

  const handleApproveStore = async (submissionId: string) => {
    if (!currentUser) return;
    await api.approveStoreSubmission(submissionId, currentUser.id);
    await loadAllData();
  };

  // User Management
  const handleUpdateRole = async (userId: string, role: UserRoleType) => {
    await api.updateUserRole(userId, role);
    await loadAllData();
  };

  const handleToggleActive = async (userId: string) => {
    await api.toggleUserActive(userId);
    await loadAllData();
  };

  const handleApproveUser = async (userId: string) => {
    await api.approveUser(userId);
    await loadAllData();
  };

  // Stores & Store Types
  const handleAddStore = async (newStoreData: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => {
    await api.createStore(newStoreData);
    await loadAllData();
  };

  const handleUpdateStore = async (id: string, updates: Partial<Store>) => {
    await api.updateStore(id, updates);
    await loadAllData();
  };

  const handleAddStoreType = async (data: Omit<StoreTypeItem, 'id'>) => {
    await api.createStoreType(data);
    await loadAllData();
  };

  const handleUpdateStoreType = async (id: string, updates: Partial<StoreTypeItem>) => {
    await api.updateStoreType(id, updates);
    await loadAllData();
  };

  const handleAddCategory = async (data: Omit<Category, 'id' | 'created_at'>) => {
    await api.createCategory(data);
    await loadAllData();
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    await api.updateCategory(id, updates);
    await loadAllData();
  };

  const handleSubmitPriceObservation = async (data: {
    productId: string;
    storeId: string;
    observedPrice: number;
    observationDate: string;
    evidenceImageUrl?: string;
    remarks?: string;
  }) => {
    if (!currentUser) return;
    await api.submitPriceObservation({
      ...data,
      contributorId: currentUser.id,
    });
    await loadAllData();
  };

  const handleAddProduct = async (data: any) => {
    // Register product as submission or direct insert
    if (currentUser?.role === 'admin' || currentUser?.role === 'verifier') {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: data.name,
        barcode: data.barcode,
        description: data.description,
        category_id: data.category_id,
        brand_id: null,
        package_quantity: data.package_quantity,
        unit_id: data.unit_id,
        image_url: data.image_url,
        is_active: true,
        lowest_verified_price: data.initial_price,
        highest_verified_price: data.initial_price,
        average_verified_price: data.initial_price,
        stores_count: 1,
        last_observed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: (await api.getProducts()).find(p => p.category_id === data.category_id)?.category,
      };
      // add to products
      const prods = await api.getProducts();
      prods.unshift(newProd);
      await loadAllData();
    }
  };

  // Switch User Profile / Role
  const handleSwitchUser = () => {
    if (!currentUser) return;
    const currentIndex = profiles.findIndex((p) => p.id === currentUser.id);
    const nextIndex = (currentIndex + 1) % profiles.length;
    setCurrentUser(profiles[nextIndex]);
  };

  const pendingCount =
    priceSubmissions.filter((s) => s.status === 'pending').length +
    productSubmissions.filter((s) => s.status === 'pending').length +
    storeSubmissions.filter((s) => s.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7F0] flex items-center justify-center text-primary font-headline font-bold text-base">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
          <span>Loading SaanMura Control Center...</span>
        </div>
      </div>
    );
  }

  // If user explicitly signs out, show login view
  if (!currentUser) {
    return (
      <LoginView
        availableProfiles={profiles}
        onLogin={(profile) => setCurrentUser(profile)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7F0] text-[#111c2d] flex flex-col font-body">
      {/* Top Navigation Bar */}
      <TopNavBar
        currentView={currentView}
        onNavigate={setCurrentView}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        pendingCount={pendingCount}
      />

      {/* Main Body: Sidebar + Dynamic Canvas */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        <SideNavBar
          currentView={currentView}
          onNavigate={setCurrentView}
          pendingCount={pendingCount}
          onOpenAddModal={() => {
            setProductForPriceObservation(products[0] || null);
            setIsLogPriceOpen(true);
          }}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {currentView === 'dashboard' && stats && (
            <AdminControlCenterView
              stats={stats}
              products={products}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'queue' && (
            <VerificationQueueView
              priceSubmissions={priceSubmissions}
              productSubmissions={productSubmissions}
              storeSubmissions={storeSubmissions}
              currentUser={currentUser}
              onApprovePrice={handleApprovePrice}
              onRejectPrice={handleRejectPrice}
              onRequestClarification={handleRequestClarification}
              onApproveProduct={handleApproveProduct}
              onApproveStore={handleApproveStore}
            />
          )}

          {currentView === 'catalog' && (
            <CatalogDiscoveryView
              products={products}
              categories={categories}
              stores={stores}
              storeTypes={storeTypes}
              onSelectProduct={(p) => setSelectedProductForDetail(p)}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onAddStoreType={handleAddStoreType}
              onUpdateStoreType={handleUpdateStoreType}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
            />
          )}

          {currentView === 'stores' && (
            <StoreRegistryView
              stores={stores}
              storeTypes={storeTypes}
              onAddStore={handleAddStore}
              onUpdateStore={handleUpdateStore}
            />
          )}

          {currentView === 'users' && (
            <UserManagementView
              profiles={profiles}
              onUpdateRole={handleUpdateRole}
              onToggleActive={handleToggleActive}
              onApproveUser={handleApproveUser}
            />
          )}

          {currentView === 'srp' && (
            <DtiReferenceView references={references} />
          )}

          {currentView === 'audit' && (
            <AuditLogsView logs={auditLogs} />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        units={products.map((p) => p.unit).filter(Boolean) as any}
        stores={stores}
        onSubmit={handleAddProduct}
      />

      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddPriceObservation={(productId) => {
          const prod = products.find((p) => p.id === productId) || selectedProductForDetail;
          setSelectedProductForDetail(null);
          setProductForPriceObservation(prod);
          setIsLogPriceOpen(true);
        }}
      />

      <LogPriceObservationModal
        isOpen={isLogPriceOpen}
        onClose={() => {
          setIsLogPriceOpen(false);
          setProductForPriceObservation(null);
        }}
        product={productForPriceObservation}
        availableProducts={products}
        stores={stores}
        onSubmit={handleSubmitPriceObservation}
      />
    </div>
  );
};
