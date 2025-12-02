import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getProduct, getUser } from '../firebase/firestore';

const CONVERSATIONS_KEY = '@badgerswap_conversations';
const MESSAGES_KEY = '@badgerswap_messages';

// ChatPage: Multi-conversation chat UI with conversation list and active chat view.
// Backend will integrate Firebase to load real conversations and messages.
export default function ChatPage({ route, navigation }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load conversations and messages from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [conversationsData, messagesData] = await Promise.all([
          AsyncStorage.getItem(CONVERSATIONS_KEY),
          AsyncStorage.getItem(MESSAGES_KEY),
        ]);

        if (conversationsData) {
          const parsedConversations = JSON.parse(conversationsData);
          // Convert timestamp strings back to Date objects
          const conversationsWithDates = parsedConversations.map(conv => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
          }));
          setConversations(conversationsWithDates);
        }

        if (messagesData) {
          const parsedMessages = JSON.parse(messagesData);
          // Convert message timestamp strings back to Date objects
          const messagesWithDates = {};
          Object.keys(parsedMessages).forEach(convId => {
            messagesWithDates[convId] = parsedMessages[convId].map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
          });
          setMessages(messagesWithDates);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading chat data:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save conversations to AsyncStorage whenever they change
  useEffect(() => {
    if (isLoaded && conversations.length > 0) {
      AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations)).catch(error =>
        console.error('Error saving conversations:', error)
      );
    }
  }, [conversations, isLoaded]);

  // Save messages to AsyncStorage whenever they change
  useEffect(() => {
    if (isLoaded && Object.keys(messages).length > 0) {
      AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages)).catch(error =>
        console.error('Error saving messages:', error)
      );
    }
  }, [messages, isLoaded]);

  // When navigating from a product listing, check if conversation exists or create new one
  useEffect(() => {
    if (route?.params?.sellerId && route?.params?.productId) {
      const { sellerId, productId } = route.params;
      
      // Check if conversation already exists using functional state update
      setConversations((prevConversations) => {
        const existingConv = prevConversations.find(
          c => c.sellerId === sellerId && c.productId === productId
        );

        if (existingConv) {
          setActiveConversationId(existingConv.id);
          return prevConversations; // No change needed
        } else {
          // Create new conversation - fetch seller and product details from Firebase
          const createConversation = async () => {
            try {
              let sellerName = 'Seller';
              let productTitle = 'Product';

              // Fetch product info first (might have seller name)
              try {
                const productData = await getProduct(productId);
                productTitle = productData.title || 'Product';
                // Use seller name from product if available
                if (productData.sellerName) {
                  sellerName = productData.sellerName;
                }
              } catch (error) {
                console.error('Error fetching product:', error);
              }

              // Try to fetch seller info from users collection
              try {
                const sellerData = await getUser(sellerId);
                // Override with user profile name if available
                sellerName = sellerData.name || sellerData.email || sellerName;
              } catch (error) {
                console.error('Error fetching seller user:', error);
              }

              console.log('Creating conversation with seller:', sellerName, 'product:', productTitle);

              const newConv = {
                id: `conv_${Date.now()}`,
                sellerId,
                sellerName,
                productTitle,
                productId,
                lastMessage: '',
                timestamp: new Date(),
                unread: false,
              };
              
              setConversations((prev) => [newConv, ...prev]);
              setActiveConversationId(newConv.id);
              setMessages((prevMessages) => ({ ...prevMessages, [newConv.id]: [] }));
            } catch (error) {
              console.error('Error creating conversation:', error);
            }
          };

          createConversation();
          return prevConversations; // Will be updated in the async function
        }
      });
    }
  }, [route?.params?.sellerId, route?.params?.productId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = messages[activeConversationId] || [];

  const handleSend = () => {
    if (input.trim() && activeConversationId) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        text: input.trim(),
        sender: 'me',
        timestamp: new Date(),
      };

      // Add message to active conversation
      setMessages({
        ...messages,
        [activeConversationId]: [...(messages[activeConversationId] || []), newMessage],
      });

      // Update conversation's last message
      setConversations(
        conversations.map(c =>
          c.id === activeConversationId
            ? { ...c, lastMessage: input.trim(), timestamp: new Date() }
            : c
        )
      );

      setInput('');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        activeConversationId === item.id && styles.conversationItemActive,
      ]}
      onPress={() => setActiveConversationId(item.id)}
    >
      <View style={styles.conversationAvatar}>
        <Ionicons name="person" size={24} color="#666" />
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.sellerName}
          </Text>
          <Text style={styles.conversationTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.conversationProduct} numberOfLines={1}>
          {item.productTitle}
        </Text>
        <Text
          style={[
            styles.conversationLastMessage,
            item.unread && styles.conversationLastMessageUnread,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage || 'Start a conversation...'}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.content}>
        {/* Conversations List - hide when chat is active on mobile */}
        {!activeConversation && (
          <View style={styles.conversationsList}>
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.conversationsContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No conversations yet</Text>
                  <Text style={styles.emptySubtext}>
                    Message a seller from a product listing
                  </Text>
                </View>
              }
            />
          </View>
        )}

        {/* Active Chat View */}
        {activeConversation && (
          <View style={styles.chatContainer}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setActiveConversationId(null)}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatHeaderName}>{activeConversation.sellerName}</Text>
                <Text style={styles.chatHeaderProduct} numberOfLines={1}>
                  {activeConversation.productTitle}
                </Text>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
            >
              {activeMessages.length === 0 ? (
                <View style={styles.emptyChat}>
                  <Text style={styles.emptyChatText}>Start the conversation!</Text>
                </View>
              ) : (
                activeMessages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.sender === 'me' ? styles.myMessage : styles.theirMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.sender === 'me' ? styles.myMessageText : styles.theirMessageText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationsList: {
    width: '100%',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  conversationsContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  conversationItemActive: {
    backgroundColor: '#f0f0f0',
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  conversationProduct: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#999',
  },
  conversationLastMessageUnread: {
    fontWeight: '600',
    color: '#000',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    position: 'absolute',
    top: 20,
    right: 12,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chatHeaderProduct: {
    fontSize: 13,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChatText: {
    fontSize: 16,
    color: '#999',
  },
  messageBubble: {
    maxWidth: '75%',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#000',
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  noConversationSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  noConversationText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});