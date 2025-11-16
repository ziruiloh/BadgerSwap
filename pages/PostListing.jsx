import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase/config';
import { addProduct } from '../firebase/firestore';

export default function PostListing({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Textbooks', 'Clothing', 'Electronics', 'Furniture', 'Other'];

  const handleSubmit = async () => {
    if (!title.trim()) return alert('Please enter a title');
    if (!price.trim()) return alert('Please enter a price');

    setLoading(true);
    try {
      const seller = auth.currentUser;
      const product = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        location: location.trim(),
        image: imageUrl.trim() || null,
        sellerId: seller ? seller.uid : null,
        sellerName: seller ? seller.displayName || seller.email : 'Unknown',
        createdAt: new Date().toISOString(),
      };

      const id = await addProduct(product);
      setLoading(false);
      // navigate to listing details of the newly created product
      navigation.replace('ListingDetails', { product: { ...product, id } });
    } catch (err) {
      setLoading(false);
      console.error('Failed to post listing', err);
      alert('Failed to post listing');
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

          <Text style={styles.label}>Image URL (optional)</Text>
          <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

          <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Post listing</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backButton: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16 },
  form: { marginTop: 8 },
  label: { fontSize: 14, color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  submitButton: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600' },
});
