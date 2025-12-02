import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../firebase/config';
import { getUser } from '../firebase/firestore';

// ProfilePage: Displays current user info, reputation, join date, and basic action buttons.
export default function ProfilePage({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Refresh profile when screen comes into focus (e.g., after editing)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserProfile = async () => {
    if (auth.currentUser) {
      try {
        const userData = await getUser(auth.currentUser.uid);
        setUser({
          name: userData.name || auth.currentUser.displayName || 'User',
          email: auth.currentUser.email,
          photo: userData.profileImage || userData.photoURL || auth.currentUser.photoURL || 'https://via.placeholder.com/150',
          reputation: userData.reputation || 4.8,
          joinDate: auth.currentUser.metadata?.creationTime ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString() : 'January 2023',
          bio: userData.bio || '',
        });
      } catch (error) {
        // If user document doesn't exist, use auth user data
        setUser({
          name: auth.currentUser.displayName || 'User',
          email: auth.currentUser.email,
          photo: auth.currentUser.photoURL || 'https://via.placeholder.com/150',
          reputation: 4.8,
          joinDate: auth.currentUser.metadata?.creationTime ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString() : 'January 2023',
          bio: '',
        });
      }
    }
  };

  // Sign out user from Firebase auth.
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user.photo }}
            style={styles.profilePhoto}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.bio ? (
              <Text style={styles.bio}>{user.bio}</Text>
            ) : (
              <Text style={styles.bioPlaceholder}>No bio yet. Tap "Edit Profile" to add one.</Text>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Reputation</Text>
                  <View style={styles.reputationStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < Math.round(user.reputation || 0) ? 'star' : 'star-outline'}
                        size={18}
                        color="#FFD700"
                        style={{ marginRight: 4 }}
                      />
                    ))}
                    <Text style={styles.statValue}> {user.reputation}</Text>
                  </View>
              </View>

              <View style={styles.stat}>
                <Text style={styles.statLabel}>Member Since</Text>
                <Text style={styles.statValue}>{user.joinDate}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyListingsPage')}
          >
            <Text style={styles.actionButtonText}>My Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  bioPlaceholder: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
  },
});
