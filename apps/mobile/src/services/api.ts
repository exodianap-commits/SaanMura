import type { 
  Product, Store, PriceSubmission, ProductSubmission, StoreChangeSubmission, 
  Category, Profile, SubmissionStatus 
} from '@saanmura/shared-types';
import { calculatePriceDelta } from '@saanmura/domain';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'All (4.8k)', slug: 'all', icon: '🏪', display_order: 0, created_at: '2026-01-01' },
  { id: 'cat-1', name: 'Instant Noodles', slug: 'instant-noodles', icon: '🍜', display_order: 1, created_at: '2026-01-01' },
  { id: 'cat-2', name: 'Canned Goods', slug: 'canned-goods', icon: '🥫', display_order: 2, created_at: '2026-01-01' },
  { id: 'cat-3', name: 'Bigas / Rice', slug: 'rice', icon: '🌾', display_order: 3, created_at: '2026-01-01' },
  { id: 'cat-4', name: 'Cooking Oil', slug: 'cooking-oil', icon: '🍳', display_order: 4, created_at: '2026-01-01' },
  { id: 'cat-5', name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛', display_order: 5, created_at: '2026-01-01' },
  { id: 'cat-6', name: 'Condiments', slug: 'condiments', icon: '🧂', display_order: 6, created_at: '2026-01-01' },
  { id: 'cat-7', name: 'Fresh Meat', slug: 'fresh-meat', icon: '🥩', display_order: 7, created_at: '2026-01-01' },
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Puregold',
    branch_name: 'Paso de Blas',
    store_type: 'supermarket',
    address: 'Paso de Blas Rd, Malinta',
    city: 'Valenzuela City',
    province: 'Metro Manila',
    latitude: 14.6975,
    longitude: 120.9850,
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'store-2',
    name: 'SM Supermarket',
    branch_name: 'SM Megamall',
    store_type: 'supermarket',
    address: 'EDSA cor. Doña Julia Vargas Ave',
    city: 'Mandaluyong City',
    province: 'Metro Manila',
    latitude: 14.5846,
    longitude: 121.0567,
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'store-3',
    name: 'SM Hypermarket',
    branch_name: 'North EDSA',
    store_type: 'supermarket',
    address: 'North Ave cor. EDSA',
    city: 'Quezon City',
    province: 'Metro Manila',
    latitude: 14.6565,
    longitude: 121.0289,
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'store-4',
    name: 'Robinsons Supermarket',
    branch_name: 'Robinsons Galleria',
    store_type: 'supermarket',
    address: 'Ortigas Ave cor. EDSA',
    city: 'Quezon City',
    province: 'Metro Manila',
    latitude: 14.5905,
    longitude: 121.0601,
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'store-5',
    name: 'Nepa Q-Mart Public Market',
    branch_name: 'Wet Section',
    store_type: 'wet_market',
    address: 'Nepa Q-Mart, EDSA Cubao',
    city: 'Quezon City',
    province: 'Metro Manila',
    latitude: 14.6288,
    longitude: 121.0505,
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'store-6',
    name: 'Agora Public Market',
    branch_name: 'Palengke Center',
    store_type: 'wet_market',
    address: 'N. Domingo St',
    city: 'San Juan City',
    province: 'Metro Manila',
    latitude: 14.6033,
    longitude: 121.0285,
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'store-7',
    name: 'WalterMart',
    branch_name: 'Muñoz North EDSA',
    store_type: 'supermarket',
    address: 'EDSA cor. Roosevelt Ave',
    city: 'Quezon City',
    province: 'Metro Manila',
    latitude: 14.6561,
    longitude: 121.0182,
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Lucky Me! Instant Pancit Canton Kalamansi 80g',
    barcode: '4800016644818',
    description: 'Philippine favorite stir-fried instant noodles infused with citrus kalamansi flavor.',
    category_id: 'cat-1',
    package_quantity: 80,
    unit_id: 'unit-1',
    image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 15.00,
    highest_verified_price: 15.50,
    average_verified_price: 15.20,
    stores_count: 5,
    srp_price: 15.25,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-31T10:15:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-31',
    category: INITIAL_CATEGORIES[1],
  },
  {
    id: 'prod-2',
    name: 'Purefoods Corned Beef 150g',
    barcode: '4800016012891',
    description: 'Premium quality 100% pure beef strands seasoned with flavorful spices in easy-open can.',
    category_id: 'cat-2',
    package_quantity: 150,
    unit_id: 'unit-1',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 39.50,
    highest_verified_price: 42.80,
    average_verified_price: 41.20,
    stores_count: 6,
    srp_price: 41.50,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-31T09:42:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-31',
    category: INITIAL_CATEGORIES[2],
  },
  {
    id: 'prod-3',
    name: 'Mega Sardines in Tomato Sauce 155g',
    barcode: '4800049720015',
    description: 'Freshly caught sardines processed within hours, cooked in thick tomato sauce.',
    category_id: 'cat-2',
    package_quantity: 155,
    unit_id: 'unit-1',
    image_url: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 22.50,
    highest_verified_price: 24.50,
    average_verified_price: 23.40,
    stores_count: 4,
    srp_price: 24.00,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-30T14:20:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-30',
    category: INITIAL_CATEGORIES[2],
  },
  {
    id: 'prod-4',
    name: 'Datu Puti Vinegar White 1L',
    barcode: '4801988110027',
    description: 'Naturally fermented cane vinegar for everyday cooking and dipping.',
    category_id: 'cat-6',
    package_quantity: 1,
    unit_id: 'unit-4',
    image_url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 44.00,
    highest_verified_price: 47.00,
    average_verified_price: 45.50,
    stores_count: 5,
    srp_price: 46.50,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-29T11:00:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-29',
    category: INITIAL_CATEGORIES[6],
  },
  {
    id: 'prod-5',
    name: 'Silver Swan Soy Sauce 1L',
    barcode: '4801988120033',
    description: 'Full-bodied soy sauce brewed from high-grade soybeans for adobo and marinades.',
    category_id: 'cat-6',
    package_quantity: 1,
    unit_id: 'unit-4',
    image_url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 48.00,
    highest_verified_price: 51.00,
    average_verified_price: 49.20,
    stores_count: 4,
    srp_price: 49.00,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-28T16:30:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-28',
    category: INITIAL_CATEGORIES[6],
  },
  {
    id: 'prod-6',
    name: 'Sinandomeng Special Rice 5kg',
    barcode: '4806511223344',
    description: 'Fluffy, aromatic white grain rice harvested from Nueva Ecija.',
    category_id: 'cat-3',
    package_quantity: 5,
    unit_id: 'unit-2',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 245.00,
    highest_verified_price: 270.00,
    average_verified_price: 258.00,
    stores_count: 6,
    srp_price: 260.00,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-31T08:10:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-31',
    category: INITIAL_CATEGORIES[3],
  },
  {
    id: 'prod-7',
    name: 'Golden Fiesta Cooking Oil 1L Pouch',
    barcode: '4801988330104',
    description: 'Refined palm olein cooking oil fortified with Vitamin A.',
    category_id: 'cat-4',
    package_quantity: 1,
    unit_id: 'unit-4',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 94.50,
    highest_verified_price: 102.00,
    average_verified_price: 97.50,
    stores_count: 5,
    srp_price: 98.00,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-30T10:45:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-30',
    category: INITIAL_CATEGORIES[4],
  },
  {
    id: 'prod-8',
    name: 'Bear Brand Fortified Powdered Milk 300g',
    barcode: '4800361378812',
    description: 'Powdered milk drink with Tibay Resistensya nutrients: Iron, Zinc, and Vitamin C.',
    category_id: 'cat-5',
    package_quantity: 300,
    unit_id: 'unit-1',
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    lowest_verified_price: 102.00,
    highest_verified_price: 108.00,
    average_verified_price: 104.50,
    stores_count: 4,
    srp_price: 105.00,
    srp_status: 'below_srp',
    last_observed_at: '2026-10-29T15:20:00Z',
    created_at: '2026-01-01',
    updated_at: '2026-10-29',
    category: INITIAL_CATEGORIES[5],
  },
];

export const CURRENT_SCOUT: Profile = {
  id: 'user-contributor-1',
  email: 'scout@saanmura.ph',
  first_name: 'Rafael',
  last_name: 'Santos',
  display_name: 'Rafael Santos',
  philsys_id: '••••-••••-8921',
  address: 'Brgy. Central, Quezon City',
  city: 'Quezon City',
  province: 'Metro Manila',
  phone_number: '09178425501',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  role: 'contributor',
  tier: 'tier_2_palengke_verifier',
  trust_score: 98.4,
  xp_points: 850,
  is_active: true,
  created_at: '2026-01-01',
  updated_at: '2026-10-31',
};

export const INITIAL_CONTRIBUTIONS: PriceSubmission[] = [
  {
    id: 'sub-price-1',
    product_id: 'prod-2',
    store_id: 'store-1',
    contributor_id: 'user-contributor-1',
    observed_price: 39.50,
    previous_verified_price: 41.50,
    price_difference: -2.00,
    percentage_change: -4.82,
    observation_date: '2026-10-31',
    evidence_image_url: 'https://images.unsplash.com/photo-1554415707-9e49fe74a659?auto=format&fit=crop&w=400&q=80',
    remarks: 'Clear shelf tag promo discount verified on receipt.',
    status: 'pending',
    created_at: '2026-10-31T09:42:00Z',
    updated_at: '2026-10-31T09:42:00Z',
    product: INITIAL_PRODUCTS[1],
    store: INITIAL_STORES[0],
  },
  {
    id: 'sub-price-2',
    product_id: 'prod-1',
    store_id: 'store-3',
    contributor_id: 'user-contributor-1',
    observed_price: 15.00,
    previous_verified_price: 15.25,
    price_difference: -0.25,
    percentage_change: -1.64,
    observation_date: '2026-10-30',
    evidence_image_url: 'https://images.unsplash.com/photo-1554415707-9e49fe74a659?auto=format&fit=crop&w=400&q=80',
    remarks: 'Approved by Maria Santos on Oct 30.',
    status: 'approved',
    verifier_id: 'verifier-1',
    verifier_remarks: 'Verified against DTI suggested retail price schedule.',
    verified_at: '2026-10-30T14:00:00Z',
    created_at: '2026-10-30T10:15:00Z',
    updated_at: '2026-10-30T14:00:00Z',
    product: INITIAL_PRODUCTS[0],
    store: INITIAL_STORES[2],
  },
  {
    id: 'sub-price-3',
    product_id: 'prod-7',
    store_id: 'store-5',
    contributor_id: 'user-contributor-1',
    observed_price: 94.50,
    previous_verified_price: 98.00,
    price_difference: -3.50,
    percentage_change: -3.57,
    observation_date: '2026-10-29',
    remarks: 'Clarification requested: Please upload clearer picture of shelf barcode tag.',
    status: 'needs_clarification',
    verifier_remarks: 'Photo was blurry on the expiration date area. Please re-upload.',
    created_at: '2026-10-29T10:45:00Z',
    updated_at: '2026-10-29T11:00:00Z',
    product: INITIAL_PRODUCTS[6],
    store: INITIAL_STORES[4],
  },
];

class MobileStateStore {
  products: Product[] = [...INITIAL_PRODUCTS];
  stores: Store[] = [...INITIAL_STORES];
  contributions: PriceSubmission[] = [...INITIAL_CONTRIBUTIONS];
  categories: Category[] = [...INITIAL_CATEGORIES];
  profile: Profile = { ...CURRENT_SCOUT };

  getProducts(params?: { categorySlug?: string; search?: string; sortBy?: string }): Product[] {
    let list = [...this.products];
    if (params?.categorySlug && params.categorySlug !== 'all') {
      const cat = this.categories.find(c => c.slug === params.categorySlug);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id);
      }
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode.includes(q)
      );
    }
    if (params?.sortBy === 'price_asc') {
      list.sort((a, b) => (a.lowest_verified_price || 0) - (b.lowest_verified_price || 0));
    } else if (params?.sortBy === 'price_desc') {
      list.sort((a, b) => (b.lowest_verified_price || 0) - (a.lowest_verified_price || 0));
    }
    return list;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getProductByBarcode(barcode: string): Product | undefined {
    return this.products.find(p => p.barcode === barcode.trim());
  }

  submitPriceObservation(data: {
    productId: string;
    storeId: string;
    observedPrice: number;
    observationDate: string;
    evidenceImageUrl?: string;
    remarks?: string;
  }): PriceSubmission {
    const prod = this.getProductById(data.productId);
    const store = this.stores.find(s => s.id === data.storeId);
    const delta = calculatePriceDelta(data.observedPrice, prod?.lowest_verified_price);

    const submission: PriceSubmission = {
      id: `sub-price-${Date.now()}`,
      product_id: data.productId,
      store_id: data.storeId,
      contributor_id: this.profile.id,
      observed_price: data.observedPrice,
      previous_verified_price: prod?.lowest_verified_price,
      price_difference: delta.difference,
      percentage_change: delta.percentageChange,
      observation_date: data.observationDate,
      evidence_image_url: data.evidenceImageUrl,
      remarks: data.remarks,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product: prod,
      store,
    };

    this.contributions.unshift(submission);
    return submission;
  }

  registerProduct(data: {
    name: string;
    barcode: string;
    categoryId: string;
    packageQuantity: number;
    initialStoreId: string;
    initialPrice: number;
    observationDate: string;
    description?: string;
    imageUrl?: string;
  }): ProductSubmission {
    const newSub: ProductSubmission = {
      id: `sub-prod-${Date.now()}`,
      contributor_id: this.profile.id,
      name: data.name,
      barcode: data.barcode,
      category_id: data.categoryId,
      package_quantity: data.packageQuantity,
      unit_id: 'unit-1',
      initial_store_id: data.initialStoreId,
      initial_price: data.initialPrice,
      observation_date: data.observationDate,
      description: data.description,
      image_url: data.imageUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newSub;
  }

  suggestStore(data: {
    suggestedName: string;
    suggestedBranch?: string;
    suggestedStoreType: any;
    suggestedAddress: string;
    suggestedCity: string;
    suggestedLatitude: number;
    suggestedLongitude: number;
    remarks?: string;
  }): StoreChangeSubmission {
    const sub: StoreChangeSubmission = {
      id: `sub-store-${Date.now()}`,
      contributor_id: this.profile.id,
      suggested_name: data.suggestedName,
      suggested_branch: data.suggestedBranch,
      suggested_store_type: data.suggestedStoreType,
      suggested_address: data.suggestedAddress,
      suggested_city: data.suggestedCity,
      suggested_province: 'Metro Manila',
      suggested_latitude: data.suggestedLatitude,
      suggested_longitude: data.suggestedLongitude,
      remarks: data.remarks,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    return sub;
  }

  getMyContributions(status?: SubmissionStatus | 'all'): PriceSubmission[] {
    if (!status || status === 'all') return this.contributions;
    return this.contributions.filter(c => c.status === status);
  }
}

export const mobileStore = new MobileStateStore();
