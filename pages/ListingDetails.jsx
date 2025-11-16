import { Ionicons } from '@expo/vector-icons';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function resolveImage(product) {
  // common field names: image, imageUrl, images (array)
  if (!product) return null;
  if (product.image) return product.image;
  if (product.imageUrl) return product.imageUrl;
  if (product.images && Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  return null;
}

function resolveSellerName(product) {
  return product?.sellerName || product?.seller || product?.sellerId || 'Unknown';
}

export default function ListingDetails({ route, navigation }) {
  const { product } = route.params || {};

  const imageUri = resolveImage(product) || 'https://via.placeholder.com/800x450?text=No+Image';
  const sellerName = resolveSellerName(product);

  function formatPrice(p) {
    if (p == null) return '—';
    // support priceCents or price as number/string
    if (typeof p === 'number') {
      // if looks like cents (large int), handle heuristically
      if (p > 1000 && String(p).length > 4) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p / 100);
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
    }
    if (typeof p === 'string') {
      const n = Number(p);
      if (!isNaN(n)) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
      return p;
    }
    return String(p);
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listing</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No product data available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.title || 'Listing Details'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.info}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{product.title}</Text>
              <Text style={styles.metaSmall}>{sellerName}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(product.price ?? product.priceCents)}</Text>
          </View>

          {product.category ? <Text style={styles.meta}>Category: {product.category}</Text> : null}
          {product.location ? <Text style={styles.meta}>Location: {product.location}</Text> : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{product.description || 'No description provided.'}</Text>
          </View>

          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>Seller</Text>
              <Text style={styles.sectionText}>{sellerName}</Text>
            </View>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => navigation.navigate('Chat', { sellerId: product.sellerId, productId: product.id })}
            >
              <Text style={styles.messageButtonText}>Message seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { paddingBottom: 40 },
  imageWrapper: { width: '100%', height: 320, backgroundColor: '#f0f0f0' },
  image: { width: '100%', height: '100%' },
  info: { padding: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: '700', color: '#000', marginLeft: 12 },
  meta: { fontSize: 14, color: '#666', marginBottom: 6 },
  metaSmall: { fontSize: 13, color: '#888', marginBottom: 6 },
  section: { marginTop: 12 },
  sectionRow: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  sectionText: { fontSize: 14, color: '#333', lineHeight: 20 },
  messageButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  messageButtonText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666' },
});
