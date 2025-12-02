import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase/config';
import { addToFavorites, getProduct, isFavorited, removeFromFavorites } from '../firebase/firestore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Resolve a usable image URL from common product field variations.
function resolveImage(product) {
  if (!product) return null;
  if (product.image) return product.image;           // single image field
  if (product.imageUrl) return product.imageUrl;     // alternative naming
  if (product.images && Array.isArray(product.images) && product.images.length > 0) return product.images[0]; // first in images array
  return null;
}

// Attempt to resolve seller display name from possible fields.
function resolveSellerName(product) {
  return product?.sellerName || product?.seller || product?.sellerId || 'Unknown';
}

export default function ListingDetails({ route, navigation }) {
  const { product: initialProduct, productId } = route.params || {};
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [favorited, setFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentUser = auth.currentUser;
  const isOwner = currentUser && product?.sellerId === currentUser.uid;
  const images = product?.images || (product?.image ? [product.image] : []);

  useEffect(() => {
    if (productId && !initialProduct) {
      loadProduct();
    }
    if (currentUser && product) {
      checkFavoriteStatus();
    }
  }, [productId, currentUser, product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const loadedProduct = await getProduct(productId);
      setProduct(loadedProduct);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load listing details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const isFav = await isFavorited(currentUser.uid, product.id);
      setFavorited(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to add favorites');
      return;
    }

    try {
      setFavoriteLoading(true);
      // Optimistic update
      const newFavoritedState = !favorited;
      setFavorited(newFavoritedState);
      
      if (favorited) {
        await removeFromFavorites(currentUser.uid, product.id);
      } else {
        await addToFavorites(currentUser.uid, product.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      setFavorited(!favorited);
      Alert.alert('Error', 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditListing', { productId: product.id });
  };

  const handleReport = () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to report listings');
      return;
    }
    navigation.navigate('ReportPage', { 
      productId: product.id,
      product: product
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
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

  const imageUri = resolveImage(product) || 'https://via.placeholder.com/800x450?text=No+Image';
  const sellerName = resolveSellerName(product);

  // Format price supporting either raw dollars or cent-based integers.
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
        <Text style={styles.headerTitle} numberOfLines={1}>{product.title || 'Listing Details'}</Text>
        <View style={styles.headerActions}>
          {!isOwner && (
            <>
              <TouchableOpacity 
                onPress={toggleFavorite} 
                style={styles.favoriteButton}
                disabled={favoriteLoading}
              >
                <Ionicons 
                  name={favorited ? "heart" : "heart-outline"} 
                  size={24} 
                  color={favorited ? "#FF3B30" : "#000"} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReport} style={styles.reportButton}>
                <Ionicons name="flag-outline" size={24} color="#000" />
              </TouchableOpacity>
            </>
          )}
          {isOwner && (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons name="create-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Gallery */}
        {images.length > 0 ? (
          <View style={styles.imageGallery}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                setCurrentImageIndex(index);
              }}
            >
              {images.map((uri, index) => (
                <Image 
                  key={index} 
                  source={{ uri }} 
                  style={styles.image} 
                  resizeMode="cover" 
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={styles.imageIndicator}>
                <Text style={styles.imageIndicatorText}>
                  {currentImageIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        )}

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

            {!isOwner && (
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => {
                  // Navigate to MainApp (tabs) then to Chat tab
                  navigation.navigate('MainApp', { 
                    screen: 'Chat',
                    params: { sellerId: product.sellerId, productId: product.id }
                  });
                }}
              >
                <Text style={styles.messageButtonText}>Message seller</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 6, marginRight: 8 },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#000',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteButton: {
    padding: 6,
  },
  editButton: {
    padding: 6,
  },
  reportButton: {
    padding: 6,
  },
  content: { paddingBottom: 40 },
  imageGallery: {
    width: '100%',
    height: 320,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  imageWrapper: { width: '100%', height: 320, backgroundColor: '#f0f0f0' },
  image: { 
    width: SCREEN_WIDTH, 
    height: 320,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
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
