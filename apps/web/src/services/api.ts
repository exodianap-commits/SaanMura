import { isLiveSupabaseConfigured } from '../lib/supabase';
import { 
  INITIAL_PRODUCTS, INITIAL_STORES, INITIAL_PRICE_SUBMISSIONS, 
  INITIAL_PRODUCT_SUBMISSIONS, INITIAL_STORE_SUBMISSIONS, 
  INITIAL_REFERENCE_PRICES, INITIAL_PROFILES, INITIAL_AUDIT_LOGS, 
  INITIAL_STATS, INITIAL_CATEGORIES, INITIAL_STORE_TYPES 
} from './mockData';
import type { 
  Product, Store, PriceSubmission, ProductSubmission, StoreChangeSubmission, 
  ExternalReferencePrice, Profile, AuditLog, Category, VerificationStats, UserRoleType, StoreTypeItem 
} from '@saanmura/shared-types';

// In-memory / LocalStorage state store for seamless interactivity
class StateStore {
  products: Product[] = [];
  stores: Store[] = [];
  storeTypes: StoreTypeItem[] = [];
  priceSubmissions: PriceSubmission[] = [];
  productSubmissions: ProductSubmission[] = [];
  storeSubmissions: StoreChangeSubmission[] = [];
  referencePrices: ExternalReferencePrice[] = [];
  profiles: Profile[] = [];
  auditLogs: AuditLog[] = [];
  categories: Category[] = [];

  constructor() {
    this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem('saanmura_web_state_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.products = parsed.products || INITIAL_PRODUCTS;
        this.stores = parsed.stores || INITIAL_STORES;
        this.storeTypes = parsed.storeTypes || INITIAL_STORE_TYPES;
        this.priceSubmissions = parsed.priceSubmissions || INITIAL_PRICE_SUBMISSIONS;
        this.productSubmissions = parsed.productSubmissions || INITIAL_PRODUCT_SUBMISSIONS;
        this.storeSubmissions = parsed.storeSubmissions || INITIAL_STORE_SUBMISSIONS;
        this.referencePrices = parsed.referencePrices || INITIAL_REFERENCE_PRICES;
        this.profiles = parsed.profiles || INITIAL_PROFILES;
        this.auditLogs = parsed.auditLogs || INITIAL_AUDIT_LOGS;
        this.categories = parsed.categories || INITIAL_CATEGORIES;
        return;
      }
    } catch {
      // Fallback to initial
    }
    this.resetToDefaults();
  }

  saveState() {
    try {
      localStorage.setItem('saanmura_web_state_v3', JSON.stringify({
        products: this.products,
        stores: this.stores,
        storeTypes: this.storeTypes,
        priceSubmissions: this.priceSubmissions,
        productSubmissions: this.productSubmissions,
        storeSubmissions: this.storeSubmissions,
        referencePrices: this.referencePrices,
        profiles: this.profiles,
        auditLogs: this.auditLogs,
        categories: this.categories,
      }));
    } catch {
      // ignore
    }
  }

  resetToDefaults() {
    this.products = [...INITIAL_PRODUCTS];
    this.stores = [...INITIAL_STORES];
    this.storeTypes = [...INITIAL_STORE_TYPES];
    this.priceSubmissions = [...INITIAL_PRICE_SUBMISSIONS];
    this.productSubmissions = [...INITIAL_PRODUCT_SUBMISSIONS];
    this.storeSubmissions = [...INITIAL_STORE_SUBMISSIONS];
    this.referencePrices = [...INITIAL_REFERENCE_PRICES];
    this.profiles = [...INITIAL_PROFILES];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.categories = [...INITIAL_CATEGORIES];
    this.saveState();
  }
}

export const store = new StateStore();

export const api = {
  // 1. STATS
  async getStats(): Promise<VerificationStats> {
    if (isLiveSupabaseConfigured) {
      // Query counts from live Supabase
    }
    const pendingPrices = store.priceSubmissions.filter(s => s.status === 'pending').length;
    const pendingProducts = store.productSubmissions.filter(s => s.status === 'pending').length;
    const pendingStores = store.storeSubmissions.filter(s => s.status === 'pending').length;
    return {
      ...INITIAL_STATS,
      totalApprovedProducts: store.products.length,
      totalActiveStores: store.stores.length,
      pendingPriceSubmissions: pendingPrices,
      pendingProductSubmissions: pendingProducts,
      pendingStoreChanges: pendingStores,
    };
  },

  // 2. PRODUCTS
  async getProducts(params?: { categorySlug?: string; search?: string }): Promise<Product[]> {
    let result = [...store.products];
    if (params?.categorySlug && params.categorySlug !== 'all') {
      const cat = store.categories.find(c => c.slug === params.categorySlug);
      if (cat) {
        result = result.filter(p => p.category_id === cat.id);
      }
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode.includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    return store.products.find(p => p.id === id);
  },

  // 3. VERIFICATION QUEUE
  async getPriceSubmissions(status: 'pending' | 'approved' | 'rejected' | 'needs_clarification' | 'all' = 'pending'): Promise<PriceSubmission[]> {
    if (status === 'all') return store.priceSubmissions;
    return store.priceSubmissions.filter(s => s.status === status);
  },

  async getProductSubmissions(status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending'): Promise<ProductSubmission[]> {
    if (status === 'all') return store.productSubmissions;
    return store.productSubmissions.filter(s => s.status === status);
  },

  async getStoreSubmissions(status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending'): Promise<StoreChangeSubmission[]> {
    if (status === 'all') return store.storeSubmissions;
    return store.storeSubmissions.filter(s => s.status === status);
  },

  // Submit Price Observation for existing product
  async submitPriceObservation(data: {
    productId: string;
    storeId: string;
    contributorId: string;
    observedPrice: number;
    observationDate: string;
    evidenceImageUrl?: string;
    remarks?: string;
  }): Promise<PriceSubmission> {
    const product = store.products.find(p => p.id === data.productId);
    const storeObj = store.stores.find(s => s.id === data.storeId);
    const contributor = store.profiles.find(p => p.id === data.contributorId) || store.profiles[0];

    const prevPrice = product?.lowest_verified_price || 0;
    const diff = Number((data.observedPrice - prevPrice).toFixed(2));
    const pctChange = prevPrice > 0 ? Number(((diff / prevPrice) * 100).toFixed(2)) : 0;

    const newSub: PriceSubmission = {
      id: `psub-${Date.now()}`,
      product_id: data.productId,
      store_id: data.storeId,
      contributor_id: data.contributorId,
      observed_price: data.observedPrice,
      previous_verified_price: prevPrice,
      price_difference: diff,
      percentage_change: pctChange,
      observation_date: data.observationDate || new Date().toISOString().split('T')[0],
      evidence_image_url: data.evidenceImageUrl || null,
      remarks: data.remarks || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product: product,
      store: storeObj,
      contributor: {
        id: contributor.id,
        display_name: contributor.display_name,
        tier: contributor.tier,
        trust_score: contributor.trust_score,
        avatar_url: contributor.avatar_url,
      },
    };

    store.priceSubmissions.unshift(newSub);
    store.saveState();
    return newSub;
  },

  // Transactional Approval
  async approvePriceSubmission(submissionId: string, verifierId: string, remarks?: string): Promise<{ success: boolean; message: string }> {
    const sub = store.priceSubmissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');
    if (sub.contributor_id === verifierId) {
      throw new Error('Anti-Self-Approval Protocol: Contributors cannot self-approve their own submissions.');
    }

    const verifier = store.profiles.find(p => p.id === verifierId) || store.profiles[1];

    sub.status = 'approved';
    sub.verifier_id = verifier.id;
    sub.verifier_remarks = remarks || 'Approved by civic verifier';
    sub.verified_at = new Date().toISOString();

    // Update product price if lower
    const prod = store.products.find(p => p.id === sub.product_id);
    if (prod) {
      if (!prod.lowest_verified_price || sub.observed_price < prod.lowest_verified_price) {
        prod.lowest_verified_price = sub.observed_price;
      }
      prod.last_observed_at = new Date().toISOString();
    }

    // Award XP
    const contributor = store.profiles.find(p => p.id === sub.contributor_id);
    if (contributor) {
      contributor.xp_points += 25;
      contributor.trust_score = Math.min(100, contributor.trust_score + 0.2);
    }

    // Add Audit Log
    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_id: verifier.id,
      actor_role: verifier.role,
      action: 'APPROVE_PRICE_SUBMISSION',
      entity_type: 'price_submissions',
      entity_id: submissionId,
      new_values: { observed_price: sub.observed_price, product_id: sub.product_id },
      created_at: new Date().toISOString(),
      actor: { display_name: verifier.display_name, email: verifier.email },
    });

    store.saveState();
    return { success: true, message: 'Price observation approved and published to live catalog.' };
  },

  async rejectPriceSubmission(submissionId: string, verifierId: string, reason: string): Promise<{ success: boolean; message: string }> {
    if (!reason || reason.trim().length < 3) {
      throw new Error('A rejection reason is strictly required.');
    }
    const sub = store.priceSubmissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const verifier = store.profiles.find(p => p.id === verifierId) || store.profiles[1];
    sub.status = 'rejected';
    sub.verifier_id = verifier.id;
    sub.verifier_remarks = reason;
    sub.verified_at = new Date().toISOString();

    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_id: verifier.id,
      actor_role: verifier.role,
      action: 'REJECT_PRICE_SUBMISSION',
      entity_type: 'price_submissions',
      entity_id: submissionId,
      new_values: { reason },
      created_at: new Date().toISOString(),
      actor: { display_name: verifier.display_name, email: verifier.email },
    });

    store.saveState();
    return { success: true, message: 'Submission rejected with feedback communicated to scout.' };
  },

  async requestPriceClarification(submissionId: string, verifierId: string, remarks: string): Promise<{ success: boolean; message: string }> {
    if (!remarks || remarks.trim().length < 3) {
      throw new Error('Clarification guidelines must be specified.');
    }
    const sub = store.priceSubmissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const verifier = store.profiles.find(p => p.id === verifierId) || store.profiles[1];
    sub.status = 'needs_clarification';
    sub.verifier_id = verifier.id;
    sub.verifier_remarks = remarks;

    store.saveState();
    return { success: true, message: 'Clarification request sent to scout.' };
  },

  async approveProductSubmission(submissionId: string, verifierId: string, remarks?: string): Promise<{ success: boolean; message: string }> {
    const sub = store.productSubmissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const verifier = store.profiles.find(p => p.id === verifierId) || store.profiles[1];

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: sub.name,
      barcode: sub.barcode,
      description: sub.description,
      category_id: sub.category_id,
      brand_id: sub.brand_id,
      package_quantity: sub.package_quantity,
      unit_id: sub.unit_id,
      image_url: sub.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      is_active: true,
      lowest_verified_price: sub.initial_price,
      highest_verified_price: sub.initial_price,
      average_verified_price: sub.initial_price,
      stores_count: 1,
      last_observed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: store.categories.find(c => c.id === sub.category_id),
    };

    store.products.unshift(newProd);
    sub.status = 'approved';
    sub.verifier_id = verifier.id;
    sub.verifier_remarks = remarks || 'Approved into live catalog';
    sub.verified_at = new Date().toISOString();

    const contributor = store.profiles.find(p => p.id === sub.contributor_id);
    if (contributor) {
      contributor.xp_points += 50;
    }

    store.saveState();
    return { success: true, message: 'New product verified and published to SaanMura catalog.' };
  },

  async approveStoreSubmission(submissionId: string, verifierId: string): Promise<{ success: boolean; message: string }> {
    const sub = store.storeSubmissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Store submission not found');

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: sub.suggested_name,
      branch_name: sub.suggested_branch,
      store_type: sub.suggested_store_type,
      address: sub.suggested_address,
      city: sub.suggested_city,
      province: sub.suggested_province,
      latitude: sub.suggested_latitude,
      longitude: sub.suggested_longitude,
      is_verified: true,
      verified_by: verifierId,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.stores.push(newStore);
    sub.status = 'approved';
    sub.verified_at = new Date().toISOString();

    store.saveState();
    return { success: true, message: 'New store verified and added to geographic directory.' };
  },

  // 4. STORES & STORE TYPES
  async getStores(): Promise<Store[]> {
    return store.stores;
  },

  async createStore(storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
    const newStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.stores.push(newStore);
    store.saveState();
    return newStore;
  },

  async updateStore(id: string, updates: Partial<Store>): Promise<Store> {
    const s = store.stores.find(item => item.id === id);
    if (!s) throw new Error('Store not found');
    Object.assign(s, updates);
    s.updated_at = new Date().toISOString();
    store.saveState();
    return s;
  },

  async getStoreTypes(): Promise<StoreTypeItem[]> {
    return store.storeTypes;
  },

  async createStoreType(data: Omit<StoreTypeItem, 'id'>): Promise<StoreTypeItem> {
    const newType: StoreTypeItem = {
      ...data,
      id: `st-${Date.now()}`,
    };
    store.storeTypes.push(newType);
    store.saveState();
    return newType;
  },

  async updateStoreType(id: string, updates: Partial<StoreTypeItem>): Promise<StoreTypeItem> {
    const t = store.storeTypes.find(item => item.id === id);
    if (!t) throw new Error('Store type not found');
    Object.assign(t, updates);
    store.saveState();
    return t;
  },

  // 4b. COMMODITY CATEGORIES
  async getCategories(): Promise<Category[]> {
    return store.categories;
  },

  async createCategory(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.categories.push(newCategory);
    store.saveState();
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const c = store.categories.find(item => item.id === id);
    if (!c) throw new Error('Category not found');
    Object.assign(c, updates);
    store.saveState();
    return c;
  },

  // 5. EXTERNAL DTI REFERENCES
  async getReferencePrices(): Promise<ExternalReferencePrice[]> {
    return store.referencePrices;
  },

  async addReferencePrice(data: Omit<ExternalReferencePrice, 'id' | 'created_at'>): Promise<ExternalReferencePrice> {
    const item: ExternalReferencePrice = {
      ...data,
      id: `ref-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.referencePrices.unshift(item);
    store.saveState();
    return item;
  },

  // 6. PROFILES & ROLES
  async getProfiles(): Promise<Profile[]> {
    return store.profiles;
  },

  async updateUserRole(userId: string, newRole: UserRoleType): Promise<void> {
    const profile = store.profiles.find(p => p.id === userId);
    if (profile) {
      profile.role = newRole;
      profile.updated_at = new Date().toISOString();
      store.saveState();
    }
  },

  async toggleUserActive(userId: string): Promise<boolean> {
    const profile = store.profiles.find(p => p.id === userId);
    if (profile) {
      profile.is_active = !profile.is_active;
      profile.updated_at = new Date().toISOString();
      store.saveState();
      return profile.is_active;
    }
    return false;
  },

  async approveUser(userId: string): Promise<Profile> {
    const profile = store.profiles.find(p => p.id === userId);
    if (!profile) throw new Error('Citizen profile not found');
    profile.is_active = true;
    profile.trust_score = Math.max(profile.trust_score, 92.0);
    profile.updated_at = new Date().toISOString();

    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      actor_id: 'user-admin-1',
      actor_role: 'admin',
      action: 'APPROVE_USER_REGISTRATION',
      entity_type: 'profiles',
      entity_id: userId,
      new_values: { is_active: true, trust_score: profile.trust_score, accredited: true },
      created_at: new Date().toISOString(),
      actor: { display_name: 'Director Ramon Valenzuela', email: 'admin@saanmura.gov.ph' },
    });

    store.saveState();
    return profile;
  },

  // 7. AUDIT LOGS
  async getAuditLogs(): Promise<AuditLog[]> {
    return store.auditLogs;
  },
};
