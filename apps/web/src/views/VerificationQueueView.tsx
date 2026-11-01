import React, { useState } from 'react';
import type { PriceSubmission, ProductSubmission, StoreChangeSubmission, Profile } from '@saanmura/shared-types';
import { formatPeso } from '@saanmura/domain';

interface VerificationQueueViewProps {
  priceSubmissions: PriceSubmission[];
  productSubmissions: ProductSubmission[];
  storeSubmissions: StoreChangeSubmission[];
  currentUser: Profile;
  onApprovePrice: (id: string, remarks?: string) => Promise<void>;
  onRejectPrice: (id: string, reason: string) => Promise<void>;
  onRequestClarification: (id: string, remarks: string) => Promise<void>;
  onApproveProduct: (id: string) => Promise<void>;
  onApproveStore: (id: string) => Promise<void>;
}

export const VerificationQueueView: React.FC<VerificationQueueViewProps> = ({
  priceSubmissions,
  productSubmissions,
  storeSubmissions,
  currentUser,
  onApprovePrice,
  onRejectPrice,
  onRequestClarification,
  onApproveProduct,
  onApproveStore,
}) => {
  const [activeTab, setActiveTab] = useState<'prices' | 'products' | 'stores'>('prices');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalItem, setRejectModalItem] = useState<{ id: string; type: 'price' | 'product' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [clarifyModalItem, setClarifyModalItem] = useState<string | null>(null);
  const [clarifyRemarks, setClarifyRemarks] = useState('');
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pendingPrices = priceSubmissions.filter((s) => s.status === 'pending');
  const pendingProducts = productSubmissions.filter((s) => s.status === 'pending');
  const pendingStores = storeSubmissions.filter((s) => s.status === 'pending');

  const filteredPrices = pendingPrices.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.product?.name.toLowerCase().includes(q) ||
      sub.product?.barcode.toLowerCase().includes(q) ||
      sub.store?.name.toLowerCase().includes(q) ||
      sub.store?.city.toLowerCase().includes(q) ||
      sub.contributor?.display_name.toLowerCase().includes(q)
    );
  });

  const filteredProducts = pendingProducts.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.name.toLowerCase().includes(q) ||
      sub.barcode.toLowerCase().includes(q) ||
      sub.initial_store?.name.toLowerCase().includes(q)
    );
  });

  const filteredStores = pendingStores.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.suggested_name.toLowerCase().includes(q) ||
      (sub.suggested_branch && sub.suggested_branch.toLowerCase().includes(q)) ||
      sub.suggested_city.toLowerCase().includes(q)
    );
  });

  const handleConfirmReject = async () => {
    if (!rejectModalItem || !rejectReason.trim()) return;
    try {
      setActionLoading(rejectModalItem.id);
      await onRejectPrice(rejectModalItem.id, rejectReason);
      setRejectModalItem(null);
      setRejectReason('');
    } catch (err: unknown) {
      alert((err as Error).message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmClarify = async () => {
    if (!clarifyModalItem || !clarifyRemarks.trim()) return;
    try {
      setActionLoading(clarifyModalItem);
      await onRequestClarification(clarifyModalItem, clarifyRemarks);
      setClarifyModalItem(null);
      setClarifyRemarks('');
    } catch (err: unknown) {
      alert((err as Error).message || 'Clarification request failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Sleek Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-outline-variant/50 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">rule</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-lg font-bold text-on-surface tracking-tight">
                Consensus Verification Queue
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary text-[10px] font-bold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                Dual-Quorum Active
              </span>
            </div>
            <p className="text-on-surface-variant text-[11px]">
              Audit crowdsourced shelf prices, barcode submissions, and store locations against SRP benchmarks.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Consensus threshold configured to ≥2 independent verifiers for NCR.')}
          className="self-start sm:self-auto bg-surface-container-lowest border border-outline-variant/60 px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <span className="material-symbols-outlined text-[15px] text-outline">tune</span>
          <span>Quorum Rules</span>
        </button>
      </div>

      {/* 2. Compact Metric Strip (Ultra High Density) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Pending Count */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Awaiting:</span>
            <span className="font-headline font-bold text-sm text-on-surface">
              {pendingPrices.length + pendingProducts.length + pendingStores.length} items
            </span>
            <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-1.5 py-0.2 rounded-full">
              +4/hr
            </span>
          </div>

          <span className="hidden sm:inline text-outline-variant">|</span>

          {/* Consensus Rate */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Consensus:</span>
            <span className="font-headline font-bold text-sm text-secondary">96.2%</span>
            <span className="text-[10px] text-outline">(Dual-verified)</span>
          </div>

          <span className="hidden sm:inline text-outline-variant">|</span>

          {/* Scouts */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[16px]">groups</span>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Scouts:</span>
            <span className="font-headline font-bold text-sm text-on-surface">1,420</span>
            <span className="text-[10px] text-secondary font-semibold">+18 today</span>
          </div>

          <span className="hidden md:inline text-outline-variant">|</span>

          {/* Stores */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="material-symbols-outlined text-outline text-[16px]">store</span>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Stores:</span>
            <span className="font-headline font-bold text-sm text-on-surface">312</span>
            <span className="text-[10px] text-outline">Across NCR</span>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>Realtime Sync</span>
        </div>
      </div>

      {/* 3. Controls: Segmented Tabs & Instant Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 text-xs">
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'prices'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">price_change</span>
            <span>Price Submissions</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'prices' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
              }`}
            >
              {pendingPrices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">add_box</span>
            <span>New Products</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'products' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
              }`}
            >
              {pendingProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stores'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">add_location_alt</span>
            <span>Store Corrections</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'stores' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
              }`}
            >
              {pendingStores.length}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[220px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter queue by name, barcode, store..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 4. High-Density Queue Rows: Price Submissions */}
      {activeTab === 'prices' && (
        <div className="space-y-2">
          {filteredPrices.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/40">
              <span className="material-symbols-outlined text-secondary text-3xl mb-1">task_alt</span>
              <h3 className="font-headline font-bold text-sm text-on-surface">Queue is Clear</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {searchQuery ? 'No price submissions match your filter.' : 'All submitted prices have been verified.'}
              </p>
            </div>
          ) : (
            filteredPrices.map((sub) => {
              const diff = sub.price_difference || 0;
              const isDrop = diff < 0;
              const isRaise = diff > 0;
              const isLoading = actionLoading === sub.id;
              const isSelfSubmission = currentUser.id === sub.contributor_id;

              return (
                <div
                  key={sub.id}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-2xs hover:border-outline transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  {/* Left: Thumbnail & Core Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Compact Thumbnail (46x46) */}
                    <div className="w-[46px] h-[46px] rounded-lg bg-surface-container-low border border-outline-variant/40 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={
                          sub.product?.image_url ||
                          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={sub.product?.name || 'Product'}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product & Store Telemetry */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {/* Line 1: Product Name & Barcode */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline font-bold text-xs text-on-surface truncate max-w-[260px] sm:max-w-[340px]">
                          {sub.product?.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[10px] font-mono border border-outline-variant/40">
                          {sub.product?.barcode}
                        </span>
                      </div>

                      {/* Line 2: Store + Contributor + Trust Badge */}
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant flex-wrap">
                        <span className="font-semibold text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary">store</span>
                          {sub.store?.name}
                        </span>
                        <span className="text-outline">({sub.store?.branch_name})</span>
                        <span className="text-outline">•</span>
                        <span>Scout: <strong className="text-on-surface">{sub.contributor?.display_name || 'Scout'}</strong></span>
                        <span className="px-1.5 py-0.2 rounded-full bg-secondary-container/40 text-secondary font-bold text-[9px]">
                          {sub.contributor?.trust_score || 98}% Trust
                        </span>
                      </div>

                      {/* Line 3: Truncated Remarks if present */}
                      {sub.remarks && (
                        <p
                          className="text-[11px] text-on-surface-variant italic truncate max-w-[420px]"
                          title={sub.remarks}
                        >
                          "{sub.remarks}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Streamlined Price Delta Badge */}
                  <div className="flex items-center gap-3 shrink-0 bg-surface-container-low/60 px-3 py-1.5 rounded-lg border border-outline-variant/30 self-start md:self-center">
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-outline block leading-none">Previous</span>
                      <span className="font-headline text-xs font-bold text-on-surface-variant line-through">
                        {formatPeso(sub.previous_verified_price)}
                      </span>
                    </div>

                    <span className="material-symbols-outlined text-outline text-[14px]">arrow_forward</span>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-primary block leading-none">Observed</span>
                      <span className="font-headline text-sm font-extrabold text-on-surface">
                        {formatPeso(sub.observed_price)}
                      </span>
                    </div>

                    {/* Delta Pill */}
                    <div className="pl-1.5 border-l border-outline-variant/40">
                      {isDrop && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-fixed/60 text-secondary whitespace-nowrap">
                          ▼ {formatPeso(Math.abs(diff))} ({sub.percentage_change}%)
                        </span>
                      )}
                      {isRaise && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary-fixed text-tertiary whitespace-nowrap">
                          ▲ +{formatPeso(diff)} (+{sub.percentage_change}%)
                        </span>
                      )}
                      {!isDrop && !isRaise && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-outline whitespace-nowrap">
                          ₱0.00 (Unchanged)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions Cluster */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    {/* Evidence Inspector */}
                    {sub.evidence_image_url ? (
                      <button
                        onClick={() => setEvidencePreview(sub.evidence_image_url || null)}
                        className="px-2.5 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-semibold text-on-surface hover:bg-surface-container transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="View photo evidence (receipt or shelf price tag)"
                      >
                        <span className="material-symbols-outlined text-[15px] text-primary">image</span>
                        <span className="hidden sm:inline">Evidence</span>
                      </button>
                    ) : (
                      <span
                        className="px-2 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] text-outline cursor-not-allowed opacity-50"
                        title="No photo evidence attached"
                      >
                        No Photo
                      </span>
                    )}

                    {/* Clarify Button */}
                    <button
                      disabled={isLoading}
                      onClick={() => setClarifyModalItem(sub.id)}
                      className="p-1.5 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
                      title="Request clarification from contributor"
                    >
                      <span className="material-symbols-outlined text-[16px]">help</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      disabled={isLoading}
                      onClick={() => setRejectModalItem({ id: sub.id, type: 'price' })}
                      className="px-2.5 py-1.5 rounded-lg border border-tertiary/40 text-tertiary hover:bg-tertiary-container/30 text-xs font-bold transition-all cursor-pointer"
                      title="Reject with mandatory reason"
                    >
                      Reject
                    </button>

                    {/* Approve Button */}
                    <button
                      disabled={isLoading || isSelfSubmission}
                      onClick={async () => {
                        try {
                          setActionLoading(sub.id);
                          await onApprovePrice(sub.id);
                        } catch (err: unknown) {
                          alert((err as Error).message);
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer ${
                        isSelfSubmission
                          ? 'bg-outline/50 cursor-not-allowed opacity-60'
                          : 'bg-secondary hover:brightness-105 active:scale-[0.98]'
                      }`}
                      title={
                        isSelfSubmission
                          ? 'Civic protocol prohibits self-approving your own submissions'
                          : 'Approve this observed price'
                      }
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span>
                      <span>{isLoading ? 'Verifying...' : isSelfSubmission ? 'Self' : 'Approve'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. High-Density Queue Rows: Product Registrations */}
      {activeTab === 'products' && (
        <div className="space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/40">
              <span className="material-symbols-outlined text-secondary text-3xl mb-1">task_alt</span>
              <h3 className="font-headline font-bold text-sm text-on-surface">No Pending Products</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {searchQuery ? 'No product submissions match your filter.' : 'All new product proposals have been audited.'}
              </p>
            </div>
          ) : (
            filteredProducts.map((pSub) => (
              <div
                key={pSub.id}
                className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-2xs hover:border-outline transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-[46px] h-[46px] rounded-lg bg-surface-container-low border border-outline-variant/40 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        pSub.image_url ||
                        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={pSub.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-headline font-bold text-xs text-on-surface truncate">{pSub.name}</h3>
                      <span className="font-mono bg-surface-container px-1.5 py-0.2 rounded border border-outline-variant/40 text-[10px]">
                        {pSub.barcode}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-primary-fixed/40 text-primary text-[10px] font-semibold">
                        {pSub.category?.name || 'Commodity'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                      <span>Pkg: <strong>{pSub.package_quantity} {pSub.unit?.abbreviation || 'g'}</strong></span>
                      <span>•</span>
                      <span>Store: <strong className="text-on-surface">{pSub.initial_store?.name || 'Local Store'}</strong></span>
                      <span>•</span>
                      <span>Price: <strong className="text-primary font-bold">{formatPeso(pSub.initial_price)}</strong></span>
                    </div>
                    {pSub.description && (
                      <p className="text-[11px] text-on-surface-variant italic truncate max-w-[400px]">
                        "{pSub.description}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onApproveProduct(pSub.id)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-white hover:brightness-105 active:scale-[0.98] text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">check</span>
                    <span>Approve Product</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. High-Density Queue Rows: Store Corrections */}
      {activeTab === 'stores' && (
        <div className="space-y-2">
          {filteredStores.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/40">
              <span className="material-symbols-outlined text-secondary text-3xl mb-1">task_alt</span>
              <h3 className="font-headline font-bold text-sm text-on-surface">No Pending Store Suggestions</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {searchQuery ? 'No store suggestions match your filter.' : 'All store directory submissions are processed.'}
              </p>
            </div>
          ) : (
            filteredStores.map((sSub) => (
              <div
                key={sSub.id}
                className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-2xs hover:border-outline transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-[42px] h-[42px] rounded-lg bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-headline font-bold text-xs text-on-surface">
                        {sSub.suggested_name}{sSub.suggested_branch ? ` - ${sSub.suggested_branch}` : ''}
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-surface-container capitalize">
                        {sSub.suggested_store_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate max-w-[450px]">
                      {sSub.suggested_address}, {sSub.suggested_city}, {sSub.suggested_province}
                    </p>
                    <p className="text-[10px] font-mono text-outline">
                      GPS: {sSub.suggested_latitude.toFixed(4)}, {sSub.suggested_longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onApproveStore(sSub.id)}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-white hover:brightness-105 active:scale-[0.98] text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">check</span>
                    <span>Verify Store</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-tertiary">
              <span className="material-symbols-outlined text-2xl">cancel</span>
              <h3 className="font-headline font-bold text-base text-on-surface">Reject Price Submission</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Please provide the official verification reason for rejecting this observed price. This reason will be logged in the audit trail and sent to the civic scout.
            </p>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Mandatory Rejection Reason <span className="text-tertiary">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Blurred shelf tag; Price does not include promo condition; Store does not match location coordinates."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectModalItem(null);
                  setRejectReason('');
                }}
                className="px-3.5 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim()}
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg bg-tertiary text-white text-xs font-bold hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {clarifyModalItem && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-2xl">help</span>
              <h3 className="font-headline font-bold text-base text-on-surface">Request Clarification</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              Ask the contributor to provide additional information, an updated receipt photo, or confirm package unit specifications.
            </p>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Clarification Notes <span className="text-tertiary">*</span>
              </label>
              <textarea
                value={clarifyRemarks}
                onChange={(e) => setClarifyRemarks(e.target.value)}
                placeholder="e.g. Please re-upload clearer photo of the official POS receipt."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setClarifyModalItem(null);
                  setClarifyRemarks('');
                }}
                className="px-3.5 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold hover:bg-surface-container cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!clarifyRemarks.trim()}
                onClick={handleConfirmClarify}
                className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-fixed text-xs font-bold hover:brightness-105 disabled:opacity-50 cursor-pointer"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Lightbox */}
      {evidencePreview && (
        <div
          onClick={() => setEvidencePreview(null)}
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-surface-container-lowest rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img
              src={evidencePreview}
              alt="Evidence Shelf / Receipt"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center">
              <span className="text-xs font-bold text-on-surface block">Audited Photo Evidence (Receipt / Shelf Tag)</span>
              <span className="text-[11px] text-outline">Click anywhere to close preview</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
