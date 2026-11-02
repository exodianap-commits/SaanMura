import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  Platform, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Receipt, CheckCircle2, Clock, AlertCircle, XCircle, 
  RotateCcw, ShieldCheck, TrendingUp, Award 
} from 'lucide-react-native';
import { mobileStore } from '../../src/services/api';
import { formatPeso } from '@saanmura/domain';
import type { SubmissionStatus, PriceSubmission } from '@saanmura/shared-types';

export default function ContributionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SubmissionStatus | 'all'>('pending');

  const allContributions = mobileStore.getMyContributions();
  const filtered = activeTab === 'all' 
    ? allContributions 
    : allContributions.filter(c => c.status === activeTab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Price Watch History</Text>
            <Text style={styles.headerSubtitle}>Citizen crowd-audits & scanned shelf prices</Text>
          </View>

          <View style={styles.tierBadge}>
            <Award size={13} color="#8F4E00" />
            <Text style={styles.tierBadgeText}>Tier-2 Scout</Text>
          </View>
        </View>

        {/* 3-Column Metric Strip matching mockup */}
        <View style={styles.metricStrip}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Receipt size={14} color="#00D26A" />
              <Text style={styles.metricTagGreen}>+4 this wk</Text>
            </View>
            <Text style={styles.metricNumber}>34</Text>
            <Text style={styles.metricLabel}>Total Logs</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <CheckCircle2 size={14} color="#00D26A" />
              <Text style={styles.metricTagGreen}>91% Score</Text>
            </View>
            <Text style={styles.metricNumber}>31</Text>
            <Text style={styles.metricLabel}>Verified</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Award size={14} color="#8F4E00" />
              <Text style={styles.metricTagOrange}>Civic Pts</Text>
            </View>
            <Text style={[styles.metricNumber, { color: '#8F4E00' }]}>850</Text>
            <Text style={styles.metricLabel}>Price Scout</Text>
          </View>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.tabBar}>
          {(['pending', 'approved', 'needs_clarification', 'rejected'] as const).map((tab) => {
            const count = allContributions.filter(c => c.status === tab).length;
            const isSelected = activeTab === tab;
            const labels = {
              pending: 'Pending',
              approved: 'Approved',
              needs_clarification: 'Clarification',
              rejected: 'Rejected',
            };
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {labels[tab]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contributions List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CheckCircle2 size={36} color="#00D26A" />
              <Text style={styles.emptyTitle}>No Submissions Here</Text>
              <Text style={styles.emptySubtitle}>You have no price observations under this tab.</Text>
            </View>
          }
          renderItem={({ item }) => {
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.statusRow}>
                    {item.status === 'pending' && (
                      <View style={styles.pendingBadge}>
                        <Clock size={11} color="#6D3A00" />
                        <Text style={styles.pendingBadgeText}>PENDING VERIFICATION</Text>
                      </View>
                    )}
                    {item.status === 'approved' && (
                      <View style={styles.approvedBadge}>
                        <CheckCircle2 size={11} color="#006D34" />
                        <Text style={styles.approvedBadgeText}>APPROVED BY VERIFIER</Text>
                      </View>
                    )}
                    {item.status === 'needs_clarification' && (
                      <View style={styles.clarifyBadge}>
                        <AlertCircle size={11} color="#8F4E00" />
                        <Text style={styles.clarifyBadgeText}>ACTION REQUIRED</Text>
                      </View>
                    )}
                    {item.status === 'rejected' && (
                      <View style={styles.rejectedBadge}>
                        <XCircle size={11} color="#B52330" />
                        <Text style={styles.rejectedBadgeText}>REJECTED</Text>
                      </View>
                    )}
                    <Text style={styles.dateText}>{item.observation_date}</Text>
                  </View>

                  <Text style={styles.productName}>{item.product?.name || 'Commodity Observation'}</Text>
                  <Text style={styles.storeName}>Store: {item.store?.name} - {item.store?.branch_name}</Text>
                </View>

                {/* Price telemetry */}
                <View style={styles.priceStrip}>
                  <View>
                    <Text style={styles.priceLabel}>Observed Price</Text>
                    <Text style={styles.priceAmount}>{formatPeso(item.observed_price)}</Text>
                  </View>

                  {item.previous_verified_price && (
                    <View style={styles.deltaBox}>
                      <Text style={styles.priceLabel}>vs Previous</Text>
                      <Text style={[
                        styles.deltaAmount,
                        item.price_difference && item.price_difference < 0 ? styles.deltaGreen : styles.deltaRed
                      ]}>
                        {item.price_difference && item.price_difference < 0 ? '▼ ' : '▲ +'}
                        {formatPeso(Math.abs(item.price_difference || 0))}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Verifier Remarks */}
                {item.verifier_remarks && (
                  <View style={styles.remarksBox}>
                    <Text style={styles.remarksLabel}>Verifier Notes:</Text>
                    <Text style={styles.remarksText}>"{item.verifier_remarks}"</Text>
                  </View>
                )}

                {/* Action for clarification */}
                {item.status === 'needs_clarification' && (
                  <TouchableOpacity
                    style={styles.resubmitButton}
                    onPress={() => router.push(`/submit-price?productId=${item.product_id}&resubmitId=${item.id}`)}
                  >
                    <RotateCcw size={13} color="#FFFFFF" />
                    <Text style={styles.resubmitButtonText}>Provide Clarification & Resubmit</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
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
  headerSubtitle: {
    fontSize: 11,
    color: '#877365',
    marginTop: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFDCC2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF9F43',
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8F4E00',
  },
  metricStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 10,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricTagGreen: {
    fontSize: 8,
    fontWeight: '800',
    color: '#006D34',
    textTransform: 'uppercase',
  },
  metricTagOrange: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8F4E00',
    textTransform: 'uppercase',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111C2D',
  },
  metricLabel: {
    fontSize: 10,
    color: '#877365',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F0F3FF',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FF9F43',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#544437',
  },
  tabTextActive: {
    color: '#2E1500',
    fontWeight: '800',
  },
  listContent: {
    gap: 10,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 12,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTop: {
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFDCC2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6D3A00',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 210, 106, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  approvedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#006D34',
  },
  clarifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFDCC2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clarifyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8F4E00',
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(181, 35, 48, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rejectedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B52330',
  },
  dateText: {
    fontSize: 10,
    color: '#877365',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
  },
  storeName: {
    fontSize: 11,
    color: '#544437',
    marginTop: 2,
  },
  priceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 8,
    padding: 8,
    marginVertical: 6,
  },
  priceLabel: {
    fontSize: 9,
    color: '#877365',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111C2D',
  },
  deltaBox: {
    alignItems: 'flex-end',
  },
  deltaAmount: {
    fontSize: 12,
    fontWeight: '800',
  },
  deltaGreen: {
    color: '#006D34',
  },
  deltaRed: {
    color: '#B52330',
  },
  remarksBox: {
    backgroundColor: '#FFF7F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.4)',
    padding: 6,
    marginTop: 4,
  },
  remarksLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8F4E00',
  },
  remarksText: {
    fontSize: 11,
    color: '#544437',
    fontStyle: 'italic',
    marginTop: 1,
  },
  resubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8F4E00',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  resubmitButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111C2D',
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#877365',
    textAlign: 'center',
  },
});
