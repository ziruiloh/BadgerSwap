import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getProduct, updateProduct, deleteProduct } from '../firebase/firestore';
import { uploadMultipleImages } from '../firebase/storage';

export default function EditListing({ route, navigation }) {
  const { productId } = route.params || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [location, setLocation] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const categories = ['Textbooks', 'Clothing', 'Electronics', 'Furniture', 'Other'];
  const MAX_IMAGES = 5;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const product = await getProduct(productId);
      setTitle(product.title || '');
      setDescription(product.description || '');
      setPrice(String(product.price || ''));
      setCategory(product.category || 'Textbooks');
      setLocation(product.location || '');
      const images = product.images || (product.image ? [product.image] : []);
      setExistingImages(images);
      setInitializing(false);
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load listing');
      navigation.goBack();
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const totalImages = existingImages.length + newImages.length;
      if (totalImages >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `You can only have up to ${MAX_IMAGES} images.`);
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const remainingSlots = MAX_IMAGES - totalImages;
        const newSelections = result.assets.slice(0, remainingSlots);
        setNewImages([...newImages, ...newSelections.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const totalImages = existingImages.length + newImages.length;
      if (totalImages >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `You can only have up to ${MAX_IMAGES} images.`);
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewImages([...newImages, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeExistingImage = (index) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExistingImages(existingImages.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProduct(productId);
              Alert.alert('Success', 'Listing deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete listing');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Validation Error', 'Please enter a price');
      return;
    }
    if (existingImages.length === 0 && newImages.length === 0) {
      Alert.alert('Validation Error', 'Please keep at least one image');
      return;
    }

    setLoading(true);
    try {
      let allImageUrls = [...existingImages];

      if (newImages.length > 0) {
        setUploading(true);
        const newImageUrls = await uploadMultipleImages(newImages, productId);
        allImageUrls = [...existingImages, ...newImageUrls];
        setUploading(false);
      }

      const updates = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        location: location.trim(),
        images: allImageUrls,
      };

      await updateProduct(productId, updates);
      
      setLoading(false);
      
      Alert.alert('Success', 'Listing updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setLoading(false);
      setUploading(false);
      console.error('Failed to update listing', err);
      Alert.alert('Error', 'Failed to update listing. Please try again.');
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Photos ({totalImages}/{MAX_IMAGES})</Text>
          <Text style={styles.imageHint}>Tap X to remove images, tap + to add new ones</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
            {existingImages.map((uri, index) => (
              <View key={`existing-${index}`} style={styles.imagePreviewContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => removeExistingImage(index)}
                >
                  <Ionicons name="close-circle" size={28} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((uri, index) => (
              <View key={`new-${index}`} style={styles.imagePreviewContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => removeNewImage(index)}
                >
                  <Ionicons name="close-circle" size={28} color="#FF3B30" />
                </TouchableOpacity>
                <View style={styles.newImageBadge}>
                  <Text style={styles.newImageBadgeText}>New</Text>
                </View>
              </View>
            ))}
            {totalImages < MAX_IMAGES && (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={showImageOptions}>
                <Ionicons name="add" size={40} color="#999" />
                <Text style={styles.imagePlaceholderText}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {totalImages < MAX_IMAGES && (
            <View style={styles.imageButtonsRow}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color="#007AFF" />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={pickImageFromGallery}>
                <Ionicons name="images-outline" size={20} color="#007AFF" />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Title</Text>
          <TextInput 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
            placeholder="e.g. Calculus textbook" 
          />

          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, { minHeight: 100 }]} 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Describe your item" 
            multiline 
          />

          <Text style={styles.label}>Price (USD)</Text>
          <TextInput 
            style={styles.input} 
            value={price} 
            onChangeText={setPrice} 
            placeholder="e.g. 30" 
            keyboardType="numeric" 
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesRow}>
            {categories.map((c) => (
              <TouchableOpacity 
                key={c} 
                onPress={() => setCategory(c)} 
                style={[styles.chip, category === c && styles.chipActive]}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <TextInput 
            style={styles.input} 
            value={location} 
            onChangeText={setLocation} 
            placeholder="e.g. Madison, WI" 
          />

          <TouchableOpacity 
            style={[styles.submitButton, (loading || uploading) && { opacity: 0.7 }]} 
            onPress={handleSubmit} 
            disabled={loading || uploading}
          >
            {loading || uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>
                  {uploading ? 'Uploading images...' : 'Updating...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Update Listing</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  deleteButton: { padding: 6 },
  content: { padding: 16 },
  form: { marginTop: 8 },
  label: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 6, 
    marginTop: 12,
    fontWeight: '500',
  },
  imageHint: { fontSize: 12, color: '#666', marginBottom: 8, fontStyle: 'italic' },
  imagesScrollView: { marginBottom: 8 },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginRight: 12,
  },
  imagePlaceholderText: { fontSize: 12, color: '#666', marginTop: 8, fontWeight: '500' },
  imagePreviewContainer: { position: 'relative', marginRight: 12 },
  imagePreview: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#e0e0e0' },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  newImageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newImageBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  imageButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    gap: 6,
  },
  imageButtonText: { color: '#007AFF', fontWeight: '500' },
  input: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: '#fff',
    fontSize: 16,
  },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    marginRight: 8, 
    marginBottom: 8 
  },
  chipActive: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  submitButton: { 
    backgroundColor: '#000', 
    paddingVertical: 14, 
    borderRadius: 8, 
    marginTop: 20, 
    alignItems: 'center' 
  },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#fff', fontWeight: '500' },
});

