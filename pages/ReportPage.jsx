import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../firebase/config';
import { createReport } from '../firebase/firestore';

export default function ReportPage({ route, navigation }) {
  const { productId, userId, product } = route.params || {};
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    'Inappropriate Content',
    'Spam or Scam',
    'Misleading Information',
    'Prohibited Item',
    'Harassment',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Validation Error', 'Please select a reason for reporting');
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      Alert.alert('Validation Error', 'Please provide details for "Other" reason');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to submit a report');
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        reporterId: currentUser.uid,
        targetId: productId || userId,
        targetType: productId ? 'listing' : 'user',
        reason: selectedReason === 'Other' ? customReason.trim() : selectedReason,
        details: customReason.trim() || '',
        productTitle: product?.title || null,
        createdAt: new Date().toISOString(),
      };

      await createReport(reportData);
      
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it and take appropriate action.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {productId ? 'Report Listing' : 'Report User'}
          </Text>
          {product && (
            <Text style={styles.sectionSubtitle}>
              Reporting: {product.title}
            </Text>
          )}
          <Text style={styles.description}>
            Please select a reason for reporting. This helps us review and take appropriate action.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reason for Reporting</Text>
          {reportReasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonOption,
                selectedReason === reason && styles.reasonOptionSelected
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={styles.reasonRadio}>
                {selectedReason === reason && <View style={styles.reasonRadioSelected} />}
              </View>
              <Text style={[
                styles.reasonText,
                selectedReason === reason && styles.reasonTextSelected
              ]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedReason === 'Other' && (
          <View style={styles.section}>
            <Text style={styles.label}>Please provide details</Text>
            <TextInput
              style={styles.textArea}
              value={customReason}
              onChangeText={setCustomReason}
              placeholder="Describe the issue..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
          <Text style={styles.footerText}>
            Reports are reviewed by our team. We take all reports seriously and will take appropriate action.
          </Text>
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
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  description: { fontSize: 14, color: '#666', lineHeight: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 12 },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  reasonOptionSelected: { borderColor: '#000', backgroundColor: '#f5f5f5' },
  reasonRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  reasonText: { fontSize: 16, color: '#333', flex: 1 },
  reasonTextSelected: { fontWeight: '600', color: '#000' },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 12,
  },
  footerText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 },
});


