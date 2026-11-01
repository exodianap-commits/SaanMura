import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  SafeAreaView, Platform 
} from 'react-native';
import { 
  ShieldCheck, Award, Star, Calendar, QrCode, Settings, 
  Check, ChevronRight, Database, LogOut, HardDriveDownload 
} from 'lucide-react-native';
import { mobileStore } from '../../src/services/api';

export default function ProfileScreen() {
  const profile = mobileStore.profile;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contributor Hub</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <QrCode size={18} color="#544437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Settings size={18} color="#544437" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Identity & PhilSys Verification Card */}
        <View style={styles.identityCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: profile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' }}
                style={styles.avatar}
              />
              <View style={styles.avatarCheck}>
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>

            <View style={styles.identityInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{profile.display_name}</Text>
                <View style={styles.verifiedChip}>
                  <ShieldCheck size={10} color="#006D34" />
                  <Text style={styles.verifiedChipText}>PhilSys Verified</Text>
                </View>
              </View>

              <Text style={styles.roleSubtext}>
                Tier-2 Civic Scout ({profile.city})
              </Text>

              <View style={styles.trustScoreRow}>
                <Text style={styles.psnText}>PSN: {profile.philsys_id}</Text>
                <View style={styles.trustRating}>
                  <Star size={11} color="#00A352" fill="#00A352" />
                  <Text style={styles.trustRatingText}>{profile.trust_score}% Trust Rating</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Secondary LGU Tag */}
          <View style={styles.lguPill}>
            <View style={styles.lguPillLeft}>
              <Calendar size={12} color="#544437" />
              <Text style={styles.lguPillText}>Member since May 2024</Text>
            </View>
            <Text style={styles.lguUnitText}>QC LGU Field Unit #4</Text>
          </View>
        </View>

        {/* Level Progression & XP Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <View style={styles.xpTierRow}>
                <Award size={15} color="#8F4E00" />
                <Text style={styles.xpTierTitle}>Tier-2 Palengke Verifier</Text>
              </View>
              <Text style={styles.xpTargetText}>Next Target: Tier-3 DTI Inspector Delegate</Text>
            </View>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>{profile.xp_points} / 1,000 XP</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '85%' }]} />
          </View>

          <View style={styles.xpFooter}>
            <Text style={styles.xpRemainingText}>150 XP remaining for accreditation promotion</Text>
            <Text style={styles.xpPercentText}>85% Complete</Text>
          </View>
        </View>

        {/* Civic Contribution Stats Bento Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Civic Contribution Stats</Text>
          <Text style={styles.sectionPeriod}>Q3 Active Period</Text>
        </View>

        <View style={styles.bentoGrid}>
          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>Audited Receipts</Text>
            <Text style={styles.bentoNumber}>34</Text>
            <Text style={styles.bentoTagGreen}>+4 this week</Text>
          </View>

          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>Verified Accuracy</Text>
            <Text style={styles.bentoNumber}>98.4%</Text>
            <Text style={styles.bentoTagGreen}>Top 5% in QC</Text>
          </View>

          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>Wet Markets Covered</Text>
            <Text style={styles.bentoNumber}>6</Text>
            <Text style={styles.bentoTagOrange}>Cubao, San Juan, Muñoz</Text>
          </View>

          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>DTI Citizen Badges</Text>
            <Text style={styles.bentoNumber}>5</Text>
            <Text style={styles.bentoTagOrange}>Fair Trade Scout</Text>
          </View>
        </View>

        {/* Offline & App Settings Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <HardDriveDownload size={16} color="#8F4E00" />
              <Text style={styles.menuItemText}>Offline Catalog Cache</Text>
            </View>
            <Text style={styles.menuItemMeta}>4.8k items stored (12 MB)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <Database size={16} color="#00D26A" />
              <Text style={styles.menuItemText}>Supabase Realtime Sync</Text>
            </View>
            <Text style={styles.menuItemMeta}>Active & Synced</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111C2D',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    padding: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
  },
  identityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF9F43',
  },
  avatarCheck: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00D26A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  roleSubtext: {
    fontSize: 11,
    color: '#8F4E00',
    fontWeight: '600',
    marginTop: 2,
  },
  trustScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(218, 194, 177, 0.3)',
    marginTop: 8,
    paddingTop: 6,
  },
  psnText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#544437',
  },
  trustRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trustRatingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#006D34',
  },
  lguPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  lguPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lguPillText: {
    fontSize: 10,
    color: '#544437',
  },
  lguUnitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8F4E00',
  },
  xpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 14,
    marginBottom: 14,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  xpTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpTierTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111C2D',
  },
  xpTargetText: {
    fontSize: 10,
    color: '#877365',
    marginTop: 2,
  },
  xpPill: {
    backgroundColor: '#FFDCC2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9F43',
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8F4E00',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E7EEFF',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FF9F43',
  },
  xpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  xpRemainingText: {
    fontSize: 10,
    color: '#877365',
  },
  xpPercentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#006D34',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111C2D',
  },
  sectionPeriod: {
    fontSize: 10,
    fontWeight: '700',
    color: '#006D34',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  bentoCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 10,
  },
  bentoLabel: {
    fontSize: 10,
    color: '#877365',
    fontWeight: '600',
  },
  bentoNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
    marginVertical: 2,
  },
  bentoTagGreen: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  bentoTagOrange: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8F4E00',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 194, 177, 0.25)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111C2D',
  },
  menuItemMeta: {
    fontSize: 10,
    color: '#877365',
  },
});
