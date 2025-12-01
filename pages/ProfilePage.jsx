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
import { getCurrentUserProfile } from '../services/userService';

// ProfilePage: Displays current user info, reputation, join date, and basic action buttons.
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (auth.currentUser) {
        // Fetch user profile from Firestore
        const userProfile = await getCurrentUserProfile();
        
        setUser({
          name: userProfile.name || auth.currentUser.displayName || 'Badger User',
          email: userProfile.email || auth.currentUser.email,
          photo: userProfile.avatarUrl || auth.currentUser.photoURL || 'https://via.placeholder.com/150',
          reputation: userProfile.reputation || 5.0,
          joinDate: userProfile.createdAt 
            ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : auth.currentUser.metadata?.creationTime 
              ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : 'Recently',
          bio: userProfile.bio || 'Badger at UW-Madison',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to Firebase Auth data if Firestore fetch fails
      if (auth.currentUser) {
        setUser({
          name: auth.currentUser.displayName || 'Badger User',
          email: auth.currentUser.email,
          photo: auth.currentUser.photoURL || 'https://via.placeholder.com/150',
          reputation: 5.0,
          joinDate: auth.currentUser.metadata?.creationTime 
            ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recently',
          bio: 'Badger at UW-Madison',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign out user from Firebase auth with confirmation.
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await signOut(auth);
              // App.js auth listener will automatically navigate to LoginPage
              console.log('User logged out successfully');
            } catch (error) {
              console.error('Logout error:', error);
              setLoggingOut(false);
              Alert.alert('Logout Failed', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
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
            <Text style={styles.bio}>{user.bio}</Text>

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
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>My Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton, loggingOut && styles.actionButtonDisabled]} 
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Text style={[styles.actionButtonText, styles.logoutText]}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  actionButtonDisabled: {
    opacity: 0.5,
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
  },
  reputationStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
