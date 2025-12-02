import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../firebase/config';
import { addProduct, getUser } from '../firebase/firestore';
import { uploadListingImage } from '../firebase/storage';

// PostListing: Form for creating a new product listing with image upload to Firebase Storage.
export default function PostListing({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Local image URI
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = ['Textbooks', 'Clothing', 'Electronics', 'Furniture', 'Other'];

  // Request permission and pick image from gallery
  const pickImageFromGallery = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // Compress slightly for faster upload
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Request permission and take photo with camera
  const takePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        console.log('Photo taken:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Show options for image selection
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

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
  };

  // Validate and submit the listing
  const handleSubmit = async () => {
    if (!title.trim()) return alert('Please enter a title');
    if (!price.trim()) return alert('Please enter a price');

    setLoading(true);
    try {
      let imageUrl = null;

      // Step 1: Upload image to Firebase Storage if selected
      if (selectedImage) {
        setUploading(true);
        console.log('Uploading image to Firebase Storage...');
        imageUrl = await uploadListingImage(selectedImage);
        console.log('Image uploaded, URL:', imageUrl);
        setUploading(false);
      }

      // Step 2: Get seller info from Firestore (to get their name)
      const seller = auth.currentUser;
      let sellerName = 'Unknown';
      
      if (seller) {
        try {
          const userProfile = await getUser(seller.uid);
          sellerName = userProfile.name || seller.email;
        } catch (error) {
          console.log('Could not fetch user profile, using email:', error);
          sellerName = seller.email;
        }
      }

      // Step 3: Create product object with image URL
      const product = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        location: location.trim(),
        image: imageUrl, // URL from Firebase Storage
        sellerId: seller ? seller.uid : null,
        sellerName: sellerName,
        createdAt: new Date().toISOString(),
      };

      // Step 4: Save product to Firestore with the image URL
      const id = await addProduct(product);
      console.log('Listing created with ID:', id);
      
      setLoading(false);
      
      // Navigate to listing details of the newly created product
      navigation.replace('ListingDetails', { product: { ...product, id } });
    } catch (err) {
      setLoading(false);
      setUploading(false);
      console.error('Failed to post listing', err);
      Alert.alert('Error', 'Failed to post listing. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a Listing</Text>
        </View>

        <View style={styles.form}>
          {/* Image Upload Section */}
          <Text style={styles.label}>Photo</Text>
          <View style={styles.imageSection}>
            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Ionicons name="close-circle" size={28} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={showImageOptions}>
                <Ionicons name="camera" size={40} color="#999" />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                <Text style={styles.imagePlaceholderSubtext}>Tap to take or choose a photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick action buttons for image */}
          {!selectedImage && (
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

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, (loading || uploading) && { opacity: 0.7 }]} 
            onPress={handleSubmit} 
            disabled={loading || uploading}
          >
            {loading || uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>
                  {uploading ? 'Uploading image...' : 'Posting...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Post Listing</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  backButton: { 
    padding: 6, 
    marginRight: 8 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700' 
  },
  content: { 
    padding: 16 
  },
  form: { 
    marginTop: 8 
  },
  label: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 6, 
    marginTop: 12,
    fontWeight: '500',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: '#fff',
    fontSize: 16,
  },
  
  // Image Upload Styles
  imageSection: {
    marginBottom: 8,
  },
  imagePlaceholder: {
    height: 200,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
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
  imageButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },

  // Categories
  categoriesRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 8 
  },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    marginRight: 8, 
    marginBottom: 8 
  },
  chipActive: { 
    backgroundColor: '#000', 
    borderColor: '#000' 
  },
  chipText: { 
    color: '#333' 
  },
  chipTextActive: { 
    color: '#fff' 
  },

  // Submit Button
  submitButton: { 
    backgroundColor: '#000', 
    paddingVertical: 14, 
    borderRadius: 8, 
    marginTop: 20, 
    alignItems: 'center' 
  },
  submitText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontWeight: '500',
  },
});
