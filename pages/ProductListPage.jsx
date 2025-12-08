// ProductListPage: Displays a searchable & filterable grid of products.
// Fetches data once on mount via Firestore wrapper, then filters client-side.
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProducts } from "../firebase/firestore";

export default function ProductListPage({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch products on mount and when screen comes into focus. Uses a mounted flag to avoid state updates after unmount.
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        if (!mounted) return;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => (mounted = false);
  }, []);

  // Refresh products when screen comes into focus (e.g., after creating a listing)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const fetchProducts = async () => {
        try {
          const data = await getProducts();
          setProducts(data || []);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
      fetchProducts();
    });
    return unsubscribe;
  }, [navigation]);

  // Derive unique category list from products (prefix with 'All').
  const categoriesList = useMemo(() => {
    const cats = products.map((p) => p.category).filter(Boolean);
    const uniqueCats = Array.from(new Set(cats));
    // Ensure we have default categories even if no products exist
    const defaultCategories = ['Textbooks', 'Clothing', 'Electronics', 'Furniture', 'Other'];
    const allCategories = [...new Set([...uniqueCats, ...defaultCategories])];
    const result = ["All", ...allCategories];
    return result;
  }, [products]);

  // Heuristic price formatter: handles numbers that may represent cents (large int) or dollars.
  function formatPrice(p) {
    if (p == null) return "—";
    // price may be stored in cents or as a number
    if (typeof p === "number") {
      // heuristics: if value seems like cents, divide
      if (p > 1000 && String(p).length > 4) return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p / 100);
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p);
    }
    if (typeof p === "string") {
      const n = Number(p);
      if (!isNaN(n)) return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
      return p;
    }
    return String(p);
  }

  // Filter products by selectedCategory & searchQuery.
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filter by category (if "All" or null, show all)
      if (selectedCategory && selectedCategory !== "All" && p.category !== selectedCategory) return false;
      // Filter by search query
      if (
        searchQuery &&
        !((p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()))
      )
        return false;
      // Only show active listings (if status field exists)
      if (p.status && p.status !== 'active') return false;
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Render a product card (two-column layout). Navigates to ListingDetails when tapped.
  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ListingDetails", { product: item })}
      activeOpacity={0.85}
    >
      <View style={styles.imagePlaceholder}>
        {item.image || item.imageUrl || (item.images && item.images[0]) ? (
          <Image source={{ uri: item.image || item.imageUrl || item.images[0] }} style={styles.cardImage} />
        ) : (
          <Ionicons name="image-outline" size={40} color="#ccc" />
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(item.price ?? item.priceCents)}</Text>
        </View>

        {item.category ? <Text style={styles.productCategoryBadge}>{item.category}</Text> : null}

        <View style={styles.cardFooter}>
          <Text style={styles.sellerName}>{item.sellerName || 'Seller'}</Text>
          {typeof item.sellerReputation === 'number' ? (
            <View style={styles.reputationRow}>
              <Text style={styles.reputationText}>⭐ {item.sellerReputation}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

  <View style={styles.header}>
        <Text style={styles.headerTitle}>BadgerSwap</Text>
  {/* Search input */}
  <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search textbooks, clothing, electronics..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

  {/* Scrollable category chips for filtering */}
  <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRowTop}
          style={styles.categoryScrollView}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory || selectedCategory === 'All' ? styles.categoryChipActive : null]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text 
              style={[
                styles.categoryChipText, 
                (!selectedCategory || selectedCategory === 'All') ? styles.categoryChipTextActive : null
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categoriesList.slice(1).map((c) => {
            const categoryName = c && String(c).trim() ? String(c) : 'Uncategorized';
            return (
              <TouchableOpacity 
                key={categoryName} 
                style={[styles.categoryChip, selectedCategory === c ? styles.categoryChipActive : null]} 
                onPress={() => setSelectedCategory(selectedCategory === c ? 'All' : c)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === c ? styles.categoryChipTextActive : null]}>
                  {categoryName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

  <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

  {/* FAB for creating a new listing */}
  <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PostListing')}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  categoryScrollView: {
    maxHeight: 50,
  },
  categoryRowTop: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryChipText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  productsList: {
    paddingBottom: 140,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    paddingHorizontal: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  productCategoryBadge: {
    marginTop: 8,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 12,
    color: '#666',
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerName: { fontSize: 12, color: '#666' },
  reputationRow: { flexDirection: 'row', alignItems: 'center' },
  reputationText: { fontSize: 12, color: '#666' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
