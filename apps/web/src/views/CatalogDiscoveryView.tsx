import React, { useState } from 'react';
import type { Product, Category, Store, StoreTypeItem } from '@saanmura/shared-types';
import { formatPeso, evaluateSrpStatus } from '@saanmura/domain';
import { 
  Package, Store as StoreIcon, Plus, Edit2, CheckCircle2, 
  Search, ArrowUpDown, X, Tag
} from 'lucide-react';

interface CatalogDiscoveryViewProps {
  products: Product[];
  categories: Category[];
  stores: Store[];
  storeTypes: StoreTypeItem[];
  onSelectProduct: (product: Product) => void;
  onOpenAddProduct: () => void;
  onAddStoreType?: (data: Omit<StoreTypeItem, 'id'>) => Promise<void>;
  onUpdateStoreType?: (id: string, updates: Partial<StoreTypeItem>) => Promise<void>;
  onAddCategory?: (data: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => Promise<void>;
}

export const CatalogDiscoveryView: React.FC<CatalogDiscoveryViewProps> = ({
  products,
  categories,
  stores,
  storeTypes,
  onSelectProduct,
  onOpenAddProduct,
  onAddStoreType,
  onUpdateStoreType,
  onAddCategory,
  onUpdateCategory,
}) => {
  const [activeCatalogTab, setActiveCatalogTab] = useState<'products' | 'categories' | 'store_types'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name' | 'latest'>('price_asc');

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('🏷️');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState<number>(1);
  const [catLoading, setCatLoading] = useState(false);

  // Store Type Management State
  const [isStoreTypeModalOpen, setIsStoreTypeModalOpen] = useState(false);
  const [editingStoreType, setEditingStoreType] = useState<StoreTypeItem | null>(null);
  const [typeName, setTypeName] = useState('');
  const [typeSlug, setTypeSlug] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [typeBadgeColor, setTypeBadgeColor] = useState('primary');
  const [typeLoading, setTypeLoading] = useState(false);

  // Strictly deduplicate categories by slug or name or id
  const uniqueCategories = React.useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((cat) => {
      const key = (cat.slug || cat.name || cat.id).trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories]);

  // Filter & Search Products
  let filtered = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'all' ||
      p.category?.slug === selectedCategory ||
      p.category_id === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.brand?.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return (a.lowest_verified_price || 0) - (b.lowest_verified_price || 0);
    }
    if (sortBy === 'price_desc') {
      return (b.lowest_verified_price || 0) - (a.lowest_verified_price || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.last_observed_at || b.created_at).getTime() - new Date(a.last_observed_at || a.created_at).getTime();
  });

  // Category Handlers
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatIcon('🏷️');
    setCatDesc('');
    setCatOrder(uniqueCategories.length + 1);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatIcon(cat.icon || '🏷️');
    setCatDesc(cat.description || '');
    setCatOrder(cat.display_order || 1);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatLoading(true);

    try {
      const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingCategory) {
        if (onUpdateCategory) {
          await onUpdateCategory(editingCategory.id, {
            name: catName.trim(),
            slug,
            icon: catIcon.trim() || '🏷️',
            description: catDesc.trim(),
            display_order: Number(catOrder) || 1,
          });
        }
      } else {
        if (onAddCategory) {
          await onAddCategory({
            name: catName.trim(),
            slug,
            icon: catIcon.trim() || '🏷️',
            description: catDesc.trim(),
            display_order: Number(catOrder) || uniqueCategories.length + 1,
          });
        }
      }
      setIsCategoryModalOpen(false);
    } finally {
      setCatLoading(false);
    }
  };

  // Store Type Handlers
  const handleOpenNewStoreType = () => {
    setEditingStoreType(null);
    setTypeName('');
    setTypeSlug('');
    setTypeDesc('');
    setTypeBadgeColor('primary');
    setIsStoreTypeModalOpen(true);
  };

  const handleOpenEditStoreType = (st: StoreTypeItem) => {
    setEditingStoreType(st);
    setTypeName(st.name);
    setTypeSlug(st.slug);
    setTypeDesc(st.description);
    setTypeBadgeColor(st.badge_color || 'primary');
    setIsStoreTypeModalOpen(true);
  };

  const handleSaveStoreType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;
    setTypeLoading(true);

    try {
      const slug = typeSlug.trim() || typeName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      if (editingStoreType) {
        if (onUpdateStoreType) {
          await onUpdateStoreType(editingStoreType.id, {
            name: typeName.trim(),
            slug,
            description: typeDesc.trim(),
            badge_color: typeBadgeColor,
          });
        }
      } else {
        if (onAddStoreType) {
          await onAddStoreType({
            name: typeName.trim(),
            slug,
            description: typeDesc.trim(),
            icon: 'storefront',
            badge_color: typeBadgeColor,
            is_active: true,
          });
        }
      }
      setIsStoreTypeModalOpen(false);
    } finally {
      setTypeLoading(false);
    }
  };

  const handleToggleStoreTypeStatus = async (st: StoreTypeItem) => {
    if (onUpdateStoreType) {
      await onUpdateStoreType(st.id, { is_active: !st.is_active });
    }
  };

  const emojiPresets = ['🍜', '🥫', '🌾', '🍳', '🥛', '🧂', '🥩', '🍞', '☕', '🥤', '🧼', '🏷️'];

  return (
    <div className="space-y-4">
      {/* Top Header & Search Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-outline-variant/60 gap-3">
        <div>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            Commodities & Retail Taxonomy Catalog
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Verified basic necessities, prime commodities, and monitored retail store classifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeCatalogTab === 'products' && (
            <>
              <button
                onClick={handleOpenNewCategory}
                className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-surface-container active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Add Category</span>
              </button>
              <button
                onClick={onOpenAddProduct}
                className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed font-bold text-xs flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Register Product</span>
              </button>
            </>
          )}

          {activeCatalogTab === 'categories' && (
            <button
              onClick={handleOpenNewCategory}
              className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed font-bold text-xs flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}

          {activeCatalogTab === 'store_types' && (
            <button
              onClick={handleOpenNewStoreType}
              className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed font-bold text-xs flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Store Type</span>
            </button>
          )}
        </div>
      </div>

      {/* Catalog Mode Switcher Tabs */}
      <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 w-fit text-xs">
        <button
          onClick={() => setActiveCatalogTab('products')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCatalogTab === 'products'
              ? 'bg-surface-container-lowest text-on-surface shadow-xs'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-primary" />
          <span>Commodities Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveCatalogTab('categories')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCatalogTab === 'categories'
              ? 'bg-surface-container-lowest text-on-surface shadow-xs'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-primary" />
          <span>Product Categories ({uniqueCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveCatalogTab('store_types')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCatalogTab === 'store_types'
              ? 'bg-surface-container-lowest text-on-surface shadow-xs'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <StoreIcon className="w-3.5 h-3.5 text-primary" />
          <span>Store Types Taxonomy ({storeTypes.length})</span>
        </button>
      </div>

      {/* ================= VIEW 1: PRODUCTS CATALOG ================= */}
      {activeCatalogTab === 'products' && (
        <>
          {/* Category Chips Horizontal Bar - Deduplicated */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-primary-container text-on-primary-fixed shadow-xs'
                  : 'bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container'
              }`}
            >
              All Items ({products.length})
            </button>

            {uniqueCategories.map((cat) => {
              const isActive = selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id || cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary-fixed font-bold shadow-xs'
                      : 'bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span>{cat.icon || '🏷️'}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}

            <button
              onClick={handleOpenNewCategory}
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-primary border border-dashed border-primary/40 hover:bg-primary-fixed/20 transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer"
              title="Add a new commodity category"
            >
              <Plus className="w-3 h-3" />
              <span>New Category</span>
            </button>
          </div>

          {/* Search & Sort Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commodity name, brand, or barcode..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant/60 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="text-on-surface-variant flex items-center gap-1 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5 text-outline" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface border border-outline-variant/60 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none cursor-pointer"
              >
                <option value="price_asc">Lowest Price First</option>
                <option value="price_desc">Highest Price First</option>
                <option value="name">Product Name (A-Z)</option>
                <option value="latest">Latest Observed</option>
              </select>
            </div>
          </div>

          {/* Product Data Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline-variant/40 text-[11px] font-bold text-outline uppercase tracking-wider">
                    <th className="py-2.5 px-4">Commodity / SKU</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Net Unit</th>
                    <th className="py-2.5 px-4">Lowest Price</th>
                    <th className="py-2.5 px-4">DTI SRP Baseline</th>
                    <th className="py-2.5 px-4">Monitored Stores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-outline text-xs">
                        No commodities found matching current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product) => {
                      const srpEval = evaluateSrpStatus(
                        product.lowest_verified_price || 0,
                        product.srp_price
                      );

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-surface-container-low/40 transition-colors group cursor-pointer"
                          onClick={() => onSelectProduct(product)}
                        >
                          {/* Product & Barcode */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-surface-container p-0.5 border border-outline-variant/30 shrink-0 overflow-hidden flex items-center justify-center">
                                <img
                                  src={
                                    product.image_url ||
                                    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-on-surface block group-hover:text-primary transition-colors">
                                  {product.name}
                                </span>
                                <span className="text-[10px] font-mono text-outline">
                                  {product.barcode}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-medium border border-outline-variant/30">
                              {product.category?.name || 'Commodity'}
                            </span>
                          </td>

                          {/* Unit */}
                          <td className="py-3 px-4 font-mono text-on-surface-variant text-xs">
                            {product.package_quantity} {product.unit?.abbreviation || 'g'}
                          </td>

                          {/* Lowest Price */}
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-secondary text-sm block">
                                {formatPeso(product.lowest_verified_price || 0)}
                              </span>
                              {product.average_verified_price && (
                                <span className="text-[10px] text-outline">
                                  Avg: {formatPeso(product.average_verified_price)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* DTI SRP Baseline */}
                          <td className="py-3 px-4">
                            {product.srp_price ? (
                              <div>
                                <span className="font-bold text-on-surface block">
                                  {formatPeso(product.srp_price)}
                                </span>
                                <span
                                  className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    srpEval.status === 'below_srp' || srpEval.status === 'at_srp'
                                      ? 'bg-secondary-fixed/50 text-secondary'
                                      : 'bg-surface-container text-outline'
                                  }`}
                                >
                                  {srpEval.badgeLabel}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-outline italic">No DTI SRP</span>
                            )}
                          </td>

                          {/* Stores Count */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-xs text-on-surface font-medium">
                              <span className="material-symbols-outlined text-[15px] text-primary">
                                store
                              </span>
                              <span>{product.stores_count} stores</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= VIEW 2: PRODUCT CATEGORIES TAXONOMY ================= */}
      {activeCatalogTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h2 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Commodity Product Categories
              </h2>
              <p className="text-xs text-outline mt-0.5">
                Taxonomic classification for basic necessities, prime commodities, and retail grocery goods.
              </p>
            </div>
            <span className="text-xs font-semibold text-outline px-2.5 py-1 bg-surface-container rounded-lg">
              {uniqueCategories.length} categories configured
            </span>
          </div>

          {/* Categories Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uniqueCategories.map((cat) => {
              const linkedProductsCount = products.filter(
                (p) => p.category?.slug === cat.slug || p.category_id === cat.id
              ).length;

              return (
                <div
                  key={cat.id || cat.slug}
                  className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-primary/60 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 text-xl flex items-center justify-center shrink-0">
                          {cat.icon || '🏷️'}
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-sm text-on-surface">{cat.name}</h3>
                          <span className="text-[10px] font-mono text-outline">slug: {cat.slug}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-surface-container text-outline uppercase">
                        Order #{cat.display_order || 1}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {cat.description || 'Basic commodity category grouping.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                    <span className="font-semibold text-outline text-[11px] flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-primary" />
                      {linkedProductsCount} products listed
                    </span>

                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="px-2.5 py-1 rounded bg-surface-container text-primary font-bold text-[10px] hover:bg-surface-container-high cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 3: STORE TYPES TAXONOMY MANAGEMENT ================= */}
      {activeCatalogTab === 'store_types' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h2 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-primary" />
                Monitored Retail Channels & Store Types
              </h2>
              <p className="text-xs text-outline mt-0.5">
                Official store types used across price submissions, SRP surveillance schedules, and geographic directories.
              </p>
            </div>
            <span className="text-xs font-semibold text-outline px-2.5 py-1 bg-surface-container rounded-lg">
              {storeTypes.length} configured types
            </span>
          </div>

          {/* Store Types Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {storeTypes.map((st) => {
              const linkedStoresCount = stores.filter((s) => s.store_type === st.slug).length;

              return (
                <div 
                  key={st.id}
                  className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-primary/60 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <StoreIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-headline font-bold text-sm text-on-surface">{st.name}</h3>
                          <span className="text-[10px] font-mono text-outline">slug: {st.slug}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        st.is_active ? 'bg-secondary-fixed/50 text-secondary' : 'bg-surface-container text-outline'
                      }`}>
                        {st.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {st.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-xs">
                    <span className="font-semibold text-outline text-[11px] flex items-center gap-1">
                      <Tag className="w-3 h-3 text-primary" />
                      {linkedStoresCount} stores linked
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStoreTypeStatus(st)}
                        className="px-2 py-1 rounded text-[10px] font-semibold border border-outline-variant text-outline hover:text-on-surface cursor-pointer"
                      >
                        {st.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleOpenEditStoreType(st)}
                        className="px-2.5 py-1 rounded bg-surface-container text-primary font-bold text-[10px] hover:bg-surface-container-high cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Add / Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-base text-on-surface">
                  {editingCategory ? 'Edit Commodity Category' : 'Add New Commodity Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Category Name <span className="text-tertiary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory) {
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Beverages & Refreshments"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Category Slug / Identifier <span className="text-tertiary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. beverages"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-mono focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Icon (Emoji)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    placeholder="🥤"
                    className="w-16 p-2 rounded-xl border border-outline-variant bg-surface text-center text-lg outline-hidden focus:border-primary"
                  />
                  <span className="text-[11px] text-outline">Choose from presets or enter any emoji</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-surface-container-low rounded-xl border border-outline-variant/30">
                  {emojiPresets.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setCatIcon(em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                        catIcon === em ? 'bg-primary-container text-on-primary-fixed ring-2 ring-primary scale-105' : 'bg-surface hover:bg-surface-container'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Scope of commodities classified under this category..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface resize-none focus:border-primary outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catLoading}
                  className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-fixed text-xs font-bold shadow-md hover:brightness-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store Type Add / Edit Modal */}
      {isStoreTypeModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-base text-on-surface">
                  {editingStoreType ? 'Edit Store Type' : 'Add New Store Type'}
                </h3>
              </div>
              <button
                onClick={() => setIsStoreTypeModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreType} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Store Type Name <span className="text-tertiary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => {
                    setTypeName(e.target.value);
                    if (!editingStoreType) {
                      setTypeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
                    }
                  }}
                  placeholder="e.g. Talipapa (Satellite Market)"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Identifier Slug <span className="text-tertiary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={typeSlug}
                  onChange={(e) => setTypeSlug(e.target.value)}
                  placeholder="e.g. talipapa"
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-mono focus:border-primary outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Badge Color Accent</label>
                <select
                  value={typeBadgeColor}
                  onChange={(e) => setTypeBadgeColor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface cursor-pointer focus:border-primary outline-hidden"
                >
                  <option value="primary">Primary Orange (#FF9F43)</option>
                  <option value="secondary">Palengke Green (#00D26A)</option>
                  <option value="amber">Amber Gold</option>
                  <option value="sky">Sky Blue</option>
                  <option value="purple">Royal Purple</option>
                  <option value="emerald">Emerald</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Description</label>
                <textarea
                  rows={2}
                  value={typeDesc}
                  onChange={(e) => setTypeDesc(e.target.value)}
                  placeholder="Operational definition and scope under retail monitoring..."
                  className="w-full p-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface resize-none focus:border-primary outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsStoreTypeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={typeLoading}
                  className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-fixed text-xs font-bold shadow-md hover:brightness-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingStoreType ? 'Update Store Type' : 'Save Store Type'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
