import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase/config';
import { addProduct, getUser } from '../firebase/firestore';
import { uploadMultipleImages } from '../firebase/storage';

// PostListing: Form for creating a new product listing and persisting to Firestore.
export default function PostListing({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Furniture');
  const [location, setLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Furniture',
    'Clothing',
    'Transportation',
    'School Supplies',
    'Textbooks',
    'Electronics',
    'Other',
    'Appliances',
    'Sports',
    'Accessories'
  ];
  const MAX_IMAGES = 5;

  const pickImageFromGallery = async () => {
    try {
      if (selectedImages.length >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `You can only add up to ${MAX_IMAGES} images.`);
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
        const newImages = result.assets.slice(0, MAX_IMAGES - selectedImages.length);
        setSelectedImages([...selectedImages, ...newImages.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      if (selectedImages.length >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `You can only add up to ${MAX_IMAGES} images.`);
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
        setSelectedImages([...selectedImages, result.assets[0].uri]);
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

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  // Validate minimal required fields, compose product object & persist via addProduct.
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return;
    }
    if (!price.trim()) {
      Alert.alert('Validation Error', 'Please enter a price');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one image');
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];

      if (selectedImages.length > 0) {
        setUploading(true);
        imageUrls = await uploadMultipleImages(selectedImages);
        setUploading(false);
      }

      const seller = auth.currentUser;
      let sellerName = 'Unknown';
      
      if (seller) {
        try {
          const userProfile = await getUser(seller.uid);
          sellerName = userProfile.name || seller.email;
        } catch (error) {
          sellerName = seller.email;
        }
      }

      const product = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        location: location.trim(),
        images: imageUrls,
        sellerId: seller ? seller.uid : null,
        sellerName: sellerName,
        status: 'active',
        datePosted: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const id = await addProduct(product);
      setLoading(false);
      
      Alert.alert('Success', 'Listing posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setLoading(false);
      setUploading(false);
      console.error('Failed to post listing', err);
      Alert.alert('Error', 'Failed to post listing. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Listing</Text>
      </View>

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

        <View style={styles.form}>
          <Text style={styles.label}>Photos ({selectedImages.length}/{MAX_IMAGES})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={28} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < MAX_IMAGES && (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={showImageOptions}>
                <Ionicons name="camera" size={40} color="#999" />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {selectedImages.length < MAX_IMAGES && (
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
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Calculus textbook" />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { minHeight: 100 }]} value={description} onChangeText={setDescription} placeholder="Describe your item" multiline />

          <Text style={styles.label}>Price (USD)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. 30" keyboardType="numeric" />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesRow}>
            {categories.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Madison, WI" />

          <TouchableOpacity 
            style={[styles.submitButton, (loading || uploading) && { opacity: 0.7 }]} 
            onPress={handleSubmit} 
            disabled={loading || uploading}
          >
            {loading || uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>
                  {uploading ? 'Uploading images...' : 'Posting...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Post Listing</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  content: { padding: 16 },
  form: { marginTop: 8 },
  label: { fontSize: 14, color: '#333', marginBottom: 6, marginTop: 12, fontWeight: '500' },
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
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', fontSize: 16 },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  submitButton: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#fff', fontWeight: '500' },
});