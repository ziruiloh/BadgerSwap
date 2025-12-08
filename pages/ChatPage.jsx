import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { getOrCreateConversation, markConversationAsRead, sendMessage, subscribeToMessages } from '../firebase/chat';
import { auth, db } from '../firebase/config';

// ChatPage: Real-time Firebase-synced chat with multi-conversation support
export default function ChatPage({ route, navigation }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const currentUserId = auth.currentUser?.uid;

  // Load all conversations for current user from Firebase in real-time
  useEffect(() => {
    if (!currentUserId) {
      setConversations([]);
      return;
    }

    // Load conversations where user is either buyerId or sellerId
    const buyerQuery = query(
      collection(db, 'conversations'),
      where('buyerId', '==', currentUserId)
    );

    const sellerQuery = query(
      collection(db, 'conversations'),
      where('sellerId', '==', currentUserId)
    );

    const unsubscribeBuyer = onSnapshot(buyerQuery, (snapshot) => {
      const buyerConvs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
      setConversations(prev => {
        const sellerConvs = prev.filter(c => c.sellerId === currentUserId);
        return [...buyerConvs, ...sellerConvs];
      });
    }, (error) => {
      console.error('Error loading buyer conversations:', error);
    });

    const unsubscribeSeller = onSnapshot(sellerQuery, (snapshot) => {
      const sellerConvs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));
      setConversations(prev => {
        const buyerConvs = prev.filter(c => c.buyerId === currentUserId);
        return [...buyerConvs, ...sellerConvs];
      });
    }, (error) => {
      console.error('Error loading seller conversations:', error);
    });

    return () => {
      unsubscribeBuyer();
      unsubscribeSeller();
    };
  }, [currentUserId]);

  // Subscribe to messages for the active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    const unsubscribe = subscribeToMessages(activeConversationId, (msgs) => {
      setMessages(prev => ({
        ...prev,
        [activeConversationId]: msgs,
      }));
      
      // Mark as read when messages load or update
      if (currentUserId) {
        markConversationAsRead(activeConversationId, currentUserId).catch(err => {
          console.error('Error marking conversation as read:', err);
        });
      }
    });

    return unsubscribe;
  }, [activeConversationId, currentUserId]);

  // Handle navigation to create new conversation
  useEffect(() => {
    if (!route?.params?.sellerId || !route?.params?.productId) return;
    
    const { sellerId, productId, sellerName, productTitle } = route.params;
    if (!currentUserId) return;

    const createOrOpenConv = async () => {
      try {
        const conv = await getOrCreateConversation(
          currentUserId,
          sellerId,
          productId,
          productTitle || '', // productTitle
          sellerName || '' // sellerName
        );
        setActiveConversationId(conv.id);
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    };

    createOrOpenConv();
  }, [route?.params?.sellerId, route?.params?.productId, currentUserId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = messages[activeConversationId] || [];

  const handleSend = async () => {
    if (!input.trim() || !activeConversationId) return;

    try {
      await sendMessage(activeConversationId, currentUserId, input.trim());
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const msgDate = date instanceof Date ? date : date.toDate?.() || new Date(date);
    const now = new Date();
    const diff = now - msgDate;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return msgDate.toLocaleDateString();
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteDoc(doc(db, 'conversations', conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const renderRightActions = (conversationId) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDeleteConversation(conversationId)}
    >
      <Ionicons name="trash" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }) => {
    // Show the other person's name: if current user is seller, show buyer; if buyer, show seller
    const otherPersonName = item.sellerId === currentUserId ? (item.buyerName || 'Buyer') : (item.sellerName || 'Unknown Seller');
    const unreadCount = item.sellerId === currentUserId ? (item.unreadBySeller || 0) : (item.unreadByBuyer || 0);
    const hasUnread = unreadCount > 0;
    
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[
            styles.conversationItem,
            activeConversationId === item.id && styles.conversationItemActive,
          ]}
          onPress={() => setActiveConversationId(item.id)}
        >
          <View style={styles.conversationAvatar}>
            <Ionicons name="person" size={24} color="#666" />
            {hasUnread && <View style={styles.unreadDot} />}
          </View>
          <View style={styles.conversationContent}>
            <Text style={[styles.conversationTitle, hasUnread && styles.unreadTitle]} numberOfLines={1}>
              {otherPersonName}
            </Text>
            <Text style={[styles.conversationPreview, hasUnread && styles.unreadPreview]} numberOfLines={1}>
              {item.lastMessage || 'No messages yet'}
            </Text>
          </View>
          <View style={styles.conversationTimeContainer}>
            <Text style={styles.conversationTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUserId;
    return (
      <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.theirMessageRow]}>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.theirMessageTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.mainContent}>
        {/* Conversations List */}
        <View style={styles.conversationsContainer}>
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No conversations yet</Text>
              </View>
            }
          />
        </View>

        {/* Active Chat View */}
        {activeConversation ? (
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>
                {activeConversation.sellerId === currentUserId ? (activeConversation.buyerName || 'Buyer') : (activeConversation.sellerName || 'Seller')}
              </Text>
              <Text style={styles.chatSubtitle}>{activeConversation.productTitle || 'Product'}</Text>
            </View>

            <ScrollView
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
            >
              {activeMessages.length === 0 ? (
                <View style={styles.noMessagesContainer}>
                  <Text style={styles.noMessagesText}>Start the conversation</Text>
                </View>
              ) : (
                <FlatList
                  data={activeMessages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noConversationContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.noConversationText}>Select a conversation to start chatting</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationsContainer: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  conversationItemActive: {
    backgroundColor: '#f0f0f0',
  },
  conversationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  conversationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 12,
    color: '#666',
  },
  conversationTimeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingLeft: 8,
  },
  conversationTime: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  chatHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  chatSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 12,
  },
  messageRow: {
    paddingHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  myMessage: {
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: '#ccc',
  },
  theirMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noConversationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noConversationText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noMessagesText: {
    color: '#999',
    fontSize: 14,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#f9f9f9',
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#000',
  },
  unreadPreview: {
    fontWeight: '600',
    color: '#333',
  },
});
