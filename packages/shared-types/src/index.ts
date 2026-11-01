export type UserRoleType = 'contributor' | 'verifier' | 'admin';

export type ContributorTier = 
  | 'tier_1_scout' 
  | 'tier_2_palengke_verifier' 
  | 'tier_3_inspector';

export type SubmissionStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'needs_clarification';

export type StoreType = 
  | 'supermarket' 
  | 'wet_market' 
  | 'grocery' 
  | 'convenience' 
  | 'wholesale'
  | string;

export interface StoreTypeItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  philsys_id?: string | null;
  address: string;
  city: string;
  province: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  role: UserRoleType;
  tier: ContributorTier;
  trust_score: number;
  xp_points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRoleType;
  granted_at: string;
  granted_by?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string | null;
  display_order: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  description?: string | null;
  category_id: string;
  brand_id?: string | null;
  package_quantity: number;
  unit_id: string;
  image_url?: string | null;
  is_active: boolean;
  lowest_verified_price?: number | null;
  highest_verified_price?: number | null;
  average_verified_price?: number | null;
  stores_count: number;
  last_observed_at?: string | null;
  srp_price?: number | null;
  srp_status?: 'below_srp' | 'at_srp' | 'above_srp' | 'no_srp';
  created_at: string;
  updated_at: string;
  // Expanded joins
  category?: Category;
  brand?: Brand;
  unit?: Unit;
}

export interface ProductSubmission {
  id: string;
  contributor_id: string;
  name: string;
  barcode: string;
  category_id: string;
  brand_id?: string | null;
  package_quantity: number;
  unit_id: string;
  image_url?: string | null;
  description?: string | null;
  initial_store_id: string;
  initial_price: number;
  observation_date: string;
  receipt_image_url?: string | null;
  remarks?: string | null;
  status: SubmissionStatus;
  verifier_id?: string | null;
  verifier_remarks?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
  // Expanded joins
  contributor?: Pick<Profile, 'id' | 'display_name' | 'tier' | 'trust_score' | 'avatar_url'>;
  verifier?: Pick<Profile, 'id' | 'display_name'>;
  category?: Category;
  brand?: Brand;
  unit?: Unit;
  initial_store?: Store;
}

export interface Store {
  id: string;
  name: string;
  branch_name?: string | null;
  store_type: StoreType;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreChangeSubmission {
  id: string;
  store_id?: string | null; // null if suggesting a brand-new store
  contributor_id: string;
  suggested_name: string;
  suggested_branch?: string | null;
  suggested_store_type: StoreType;
  suggested_address: string;
  suggested_city: string;
  suggested_province: string;
  suggested_latitude: number;
  suggested_longitude: number;
  remarks?: string | null;
  status: SubmissionStatus;
  verifier_id?: string | null;
  verifier_remarks?: string | null;
  verified_at?: string | null;
  created_at: string;
  // Joins
  contributor?: Pick<Profile, 'id' | 'display_name' | 'tier' | 'trust_score'>;
  store?: Store;
}

export interface PriceSubmission {
  id: string;
  product_id: string;
  store_id: string;
  contributor_id: string;
  observed_price: number;
  previous_verified_price?: number | null;
  price_difference?: number | null;
  percentage_change?: number | null;
  observation_date: string;
  evidence_image_url?: string | null;
  receipt_image_url?: string | null;
  remarks?: string | null;
  status: SubmissionStatus;
  verifier_id?: string | null;
  verifier_remarks?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  product?: Product;
  store?: Store;
  contributor?: Pick<Profile, 'id' | 'display_name' | 'tier' | 'trust_score' | 'avatar_url'>;
  verifier?: Pick<Profile, 'id' | 'display_name'>;
}

export interface ContributorAttribution {
  contributor_id: string;
  contributor_display_name: string;
  contributor_tier?: ContributorTier;
  observation_date: string;
  verifier_id?: string | null;
  verifier_display_name?: string | null;
  verified_at?: string | null;
  evidence_image_url?: string | null;
}

export interface VerifiedPriceObservation {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  observation_date: string;
  contributor_id: string;
  contributor_display_name: string;
  verifier_id: string;
  verifier_display_name: string;
  evidence_image_url?: string | null;
  submission_id?: string | null;
  is_carried_forward: boolean;
  verified_at: string;
  created_at: string;
  // Joins
  product?: Product;
  store?: Store;
}

export interface ExternalPriceSource {
  id: string;
  source_name: 'DTI_E_PRESYO' | 'DA_BANTAY_PRESYO' | 'GOV_GAZETTE';
  agency: string;
  bulletin_number?: string | null;
  publication_date: string;
  notes?: string | null;
  created_at: string;
}

export interface ExternalReferencePrice {
  id: string;
  source_id: string;
  product_name: string;
  barcode?: string | null;
  category: string;
  brand?: string | null;
  specification?: string | null;
  unit: string;
  srp_min_price: number;
  srp_max_price: number;
  prevailing_price?: number | null;
  effective_date: string;
  created_at: string;
  // Joins
  source?: ExternalPriceSource;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'submission_approved' | 'submission_rejected' | 'clarification_needed' | 'price_alert' | 'system';
  reference_id?: string | null;
  reference_type?: 'product_submission' | 'price_submission' | 'store_submission' | 'product';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: UserRoleType;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
  actor?: Pick<Profile, 'display_name' | 'email'>;
}

export interface VerificationStats {
  totalApprovedProducts: number;
  totalActiveStores: number;
  totalVerifiedPriceRecords: number;
  pendingProductSubmissions: number;
  pendingPriceSubmissions: number;
  pendingStoreChanges: number;
  priceIncreasesCount: number;
  priceDecreasesCount: number;
  consensusRate: number;
}

export interface PriceTrendPoint {
  date: string;
  price: number;
  storeId?: string;
  storeName?: string;
  isSrp?: boolean;
}

export interface StorePriceComparison {
  storeId: string;
  storeName: string;
  branchName?: string | null;
  storeType: StoreType;
  address: string;
  city: string;
  distanceKm?: number;
  currentPrice: number;
  lastObservationDate: string;
  isStale: boolean; // e.g. > 14 days old
  priceChangePercent?: number;
  attribution: ContributorAttribution;
  srpDiff?: number;
}
