import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, Image, SafeAreaView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X, SlidersHorizontal, ArrowUpDown, Store, ShieldCheck } from 'lucide-react-native';
import { mobileStore } from '../../src/services/api';
import { formatPeso, evaluateSrpStatus } from '@saanmura/domain';
import type { Product } from '@saanmura/shared-types';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'default'>('price_asc');
  const [selectedCat, setSelectedCat] = useState('all');

  const categories = mobileStore.categories;
  const products = mobileStore.getProducts({
    categorySlug: selectedCat,
    search: query,
    sortBy,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color="#877365" />
            <TextInput
              placeholder="Search by name, barcode, brand..."
              placeholderTextColor="#877365"
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              autoFocus={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <X size={16} color="#877365" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sort & Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.sortPill, sortBy === 'price_asc' && styles.sortPillActive]}
            onPress={() => setSortBy(sortBy === 'price_asc' ? 'price_desc' : 'price_asc')}
          >
            <ArrowUpDown size={12} color={sortBy === 'price_asc' ? '#8F4E00' : '#544437'} />
            <Text style={[styles.sortPillText, sortBy === 'price_asc' && styles.sortPillTextActive]}>
              {sortBy === 'price_asc' ? 'Lowest Price' : 'Highest Price'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.resultCount}>
            {products.length} commodities found
          </Text>
        </View>

        {/* Results List */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const srpEval = evaluateSrpStatus(item.lowest_verified_price || 0, item.srp_price);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>

                  <Text style={styles.cardBarcode}>SKU: {item.barcode}</Text>

                  <View style={styles.cardMetaRow}>
                    <View style={styles.storeTag}>
                      <Store size={12} color="#8F4E00" />
                      <Text style={styles.storeTagText}>{item.stores_count} stores</Text>
                    </View>

                    {srpEval.status === 'below_srp' && (
                      <View style={styles.srpTag}>
                        <Text style={styles.srpTagText}>{srpEval.badgeLabel}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceValue}>
                      {formatPeso(item.lowest_verified_price)}
                    </Text>
                    <Text style={styles.viewDetailsText}>View Prices →</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
  searchHeader: {
    marginBottom: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#111C2D',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  sortPillActive: {
    backgroundColor: '#FFDCC2',
    borderColor: '#FF9F43',
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#544437',
  },
  sortPillTextActive: {
    color: '#8F4E00',
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 11,
    color: '#877365',
    fontWeight: '500',
  },
  listContent: {
    gap: 10,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(218, 194, 177, 0.35)',
    padding: 10,
    gap: 12,
    shadowColor: '#111C2D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImageWrapper: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111C2D',
    lineHeight: 17,
  },
  cardBarcode: {
    fontSize: 10,
    color: '#877365',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 3,
  },
  storeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  storeTagText: {
    fontSize: 10,
    color: '#544437',
    fontWeight: '500',
  },
  srpTag: {
    backgroundColor: 'rgba(0, 210, 106, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  srpTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#006D34',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8F4E00',
  },
  viewDetailsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF9F43',
  },
});
