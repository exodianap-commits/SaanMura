import React, { useState } from 'react';
import type { Profile, UserRoleType } from '@saanmura/shared-types';
import { 
  UserCheck, Shield, CheckCircle2, AlertTriangle, Eye, 
  Search, Award, MapPin, Check, X, Sparkles
} from 'lucide-react';

interface UserManagementViewProps {
  profiles: Profile[];
  onUpdateRole: (userId: string, role: UserRoleType) => Promise<void>;
  onToggleActive: (userId: string) => Promise<void>;
  onApproveUser: (userId: string) => Promise<void>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  profiles,
  onUpdateRole,
  onToggleActive,
  onApproveUser,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('all');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const pendingCount = profiles.filter(p => !p.is_active).length;
  const activeCount = profiles.filter(p => p.is_active).length;

  const filtered = profiles.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'pending' || statusFilter === 'inactive') {
      matchesStatus = !p.is_active;
    } else if (statusFilter === 'active') {
      matchesStatus = p.is_active;
    }

    const matchesSearch =
      !search ||
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.philsys_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  const handleApprove = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      await onApproveUser(userId);
      if (selectedProfile && selectedProfile.id === userId) {
        setSelectedProfile({ ...selectedProfile, is_active: true });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggle = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      await onToggleActive(userId);
      if (selectedProfile && selectedProfile.id === userId) {
        setSelectedProfile({ ...selectedProfile, is_active: !selectedProfile.is_active });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRoleType) => {
    setActionLoadingId(userId);
    try {
      await onUpdateRole(userId, role);
      if (selectedProfile && selectedProfile.id === userId) {
        setSelectedProfile({ ...selectedProfile, role });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-outline-variant/60 gap-3">
        <div>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            Civic Contributor & Accreditation Management
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container/40 text-tertiary font-bold text-xs flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {pendingCount} Pending Approval
              </span>
            )}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            PhilSys-linked citizens, accredited Palengke Scouts, and LGU field verifiers.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 shadow-xs">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search citizen scout, PhilSys ID, or city..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs' 
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              All ({profiles.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending' 
                  ? 'bg-primary-container text-on-primary-fixed shadow-xs' 
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Pending Approval
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-tertiary text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'active' 
                  ? 'bg-secondary-fixed text-secondary shadow-xs' 
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Active ({activeCount})
            </button>
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-1">
            {['all', 'contributor', 'verifier', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {role === 'all' ? 'All Roles' : `${role}s`}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Contributors Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40 text-[11px] font-bold text-outline uppercase tracking-wider">
                <th className="py-2.5 px-4">Contributor Profile</th>
                <th className="py-2.5 px-4">PhilSys Verification</th>
                <th className="py-2.5 px-4">Accreditation Tier</th>
                <th className="py-2.5 px-4">Trust Score</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filtered.map((profile) => {
                const isPending = !profile.is_active;

                return (
                  <tr 
                    key={profile.id} 
                    className={`hover:bg-surface-container-low/60 transition-colors ${
                      isPending ? 'bg-primary-fixed/10' : ''
                    }`}
                  >
                    {/* Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={profile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                          alt={profile.display_name}
                          className="w-9 h-9 rounded-full border border-primary-container object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="font-bold text-on-surface block truncate hover:text-primary hover:underline cursor-pointer text-left"
                          >
                            {profile.display_name}
                          </button>
                          <span className="text-[10px] text-on-surface-variant block">
                            {profile.email} • {profile.city || 'Metro Manila'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* PhilSys ID */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {profile.philsys_id ? (
                        <div className="flex items-center gap-1 text-on-surface font-semibold">
                          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{profile.philsys_id}</span>
                        </div>
                      ) : (
                        <span className="text-outline italic">Not verified</span>
                      )}
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-bold text-[10px] uppercase border border-outline-variant/30 inline-flex items-center gap-1">
                        <Award className="w-3 h-3 text-primary" />
                        {profile.tier.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Trust Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-bold text-secondary">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{profile.trust_score}%</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          profile.role === 'admin'
                            ? 'bg-primary text-white'
                            : profile.role === 'verifier'
                            ? 'bg-primary-container text-on-primary-fixed'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {profile.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-tertiary text-[10px] font-bold border border-tertiary/30">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          Pending Approval
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      
                      {/* APPROVE BUTTON: Shown for pending / inactive users */}
                      {isPending && (
                        <button
                          onClick={() => handleApprove(profile.id)}
                          disabled={actionLoadingId === profile.id}
                          className="px-2.5 py-1 rounded-lg bg-secondary text-white hover:bg-secondary/90 font-bold text-[10px] shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"
                          title="Verify PhilSys and approve citizen as active Contributor"
                        >
                          <UserCheck className="w-3 h-3" />
                          {actionLoadingId === profile.id ? 'Approving...' : 'Approve Scout'}
                        </button>
                      )}

                      {/* Grant / Revoke Verifier (for active accounts) */}
                      {!isPending && profile.role === 'contributor' && (
                        <button
                          onClick={() => handleRoleChange(profile.id, 'verifier')}
                          disabled={actionLoadingId === profile.id}
                          className="px-2 py-1 rounded-lg bg-secondary-fixed/60 hover:bg-secondary-fixed text-secondary font-bold text-[10px] transition-all cursor-pointer"
                          title="Promote to Verifier role"
                        >
                          Grant Verifier
                        </button>
                      )}

                      {!isPending && profile.role === 'verifier' && (
                        <button
                          onClick={() => handleRoleChange(profile.id, 'contributor')}
                          disabled={actionLoadingId === profile.id}
                          className="px-2 py-1 rounded-lg border border-outline-variant text-outline hover:text-tertiary text-[10px] font-semibold transition-all cursor-pointer"
                          title="Demote to Contributor"
                        >
                          Revoke Verifier
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => setSelectedProfile(profile)}
                        className="px-2 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container text-[10px] font-medium transition-all cursor-pointer inline-flex items-center gap-1"
                        title="View Full Profile & PhilSys Details"
                      >
                        <Eye className="w-3 h-3 text-outline" />
                        Details
                      </button>

                      {/* Deactivate / Activate Toggle */}
                      {!isPending && (
                        <button
                          onClick={() => handleToggle(profile.id)}
                          disabled={actionLoadingId === profile.id}
                          className="px-2 py-1 rounded-lg border border-outline-variant text-[10px] font-medium hover:bg-surface-container transition-all cursor-pointer"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citizen Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-on-surface">Citizen Contributor Accreditation</h3>
                  <p className="text-[11px] text-outline">PhilSys identity verification & civic scout standing</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProfile(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Bio */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
              <img
                src={selectedProfile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                alt={selectedProfile.display_name}
                className="w-14 h-14 rounded-full border-2 border-primary-container object-cover"
              />
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="font-headline font-bold text-sm text-on-surface">{selectedProfile.display_name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline">{selectedProfile.email}</span>
                  <span className="text-outline/40">•</span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                    selectedProfile.role === 'admin' ? 'bg-primary text-white' :
                    selectedProfile.role === 'verifier' ? 'bg-primary-container text-on-primary-fixed' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    {selectedProfile.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="font-bold text-secondary flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Trust Score: {selectedProfile.trust_score}%
                  </span>
                  <span className="text-outline/40">•</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {selectedProfile.xp_points} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/40 space-y-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">PhilSys National ID</span>
                <span className="font-mono font-bold text-on-surface flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  {selectedProfile.philsys_id || 'Not Provided'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/40 space-y-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Accreditation Tier</span>
                <span className="font-bold text-primary flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {selectedProfile.tier.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/40 space-y-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Registered Address</span>
                <span className="font-semibold text-on-surface flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-outline shrink-0" />
                  {selectedProfile.address}, {selectedProfile.city}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/40 space-y-1">
                <span className="text-[10px] text-outline font-bold uppercase tracking-wider block">Account Status</span>
                <span className={`font-bold flex items-center gap-1.5 ${selectedProfile.is_active ? 'text-secondary' : 'text-tertiary'}`}>
                  {selectedProfile.is_active ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-secondary" /> Active Accredited Scout
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-tertiary" /> Pending Verification & Approval
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!selectedProfile.is_active ? (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedProfile.id)}
                    className="px-4 py-2 rounded-xl bg-secondary text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve & Accredit Scout
                  </button>
                ) : (
                  <>
                    {selectedProfile.role === 'contributor' && (
                      <button
                        type="button"
                        onClick={() => handleRoleChange(selectedProfile.id, 'verifier')}
                        className="px-3.5 py-2 rounded-xl bg-primary-container text-on-primary-fixed font-bold text-xs shadow-xs hover:brightness-105 cursor-pointer"
                      >
                        Grant Verifier Role
                      </button>
                    )}
                    {selectedProfile.role === 'verifier' && (
                      <button
                        type="button"
                        onClick={() => handleRoleChange(selectedProfile.id, 'contributor')}
                        className="px-3.5 py-2 rounded-xl border border-outline-variant text-outline hover:text-tertiary font-bold text-xs cursor-pointer"
                      >
                        Revoke Verifier Role
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggle(selectedProfile.id)}
                      className="px-3.5 py-2 rounded-xl border border-outline-variant text-tertiary hover:bg-tertiary/10 font-bold text-xs cursor-pointer"
                    >
                      Deactivate Account
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
