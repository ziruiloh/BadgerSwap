import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";

import ChatPage from "../pages/ChatPage";
import FavouritesPage from "../pages/FavouritesPage";
import ProductListPage from "../pages/ProductListPage";
import ProfilePage from "../pages/ProfilePage";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const [totalUnread, setTotalUnread] = useState(0);
  const currentUserId = auth.currentUser?.uid;

  // Track total unread messages
  useEffect(() => {
    if (!currentUserId) {
      setTotalUnread(0);
      return;
    }

    const buyerQuery = query(
      collection(db, 'conversations'),
      where('buyerId', '==', currentUserId)
    );

    const sellerQuery = query(
      collection(db, 'conversations'),
      where('sellerId', '==', currentUserId)
    );

    let buyerUnreadCount = 0;
    let sellerUnreadCount = 0;

    const unsubscribeBuyer = onSnapshot(buyerQuery, (snapshot) => {
      buyerUnreadCount = snapshot.docs.reduce((sum, doc) => sum + (doc.data().unreadByBuyer || 0), 0);
      setTotalUnread(buyerUnreadCount + sellerUnreadCount);
    }, () => {});

    const unsubscribeSeller = onSnapshot(sellerQuery, (snapshot) => {
      sellerUnreadCount = snapshot.docs.reduce((sum, doc) => sum + (doc.data().unreadBySeller || 0), 0);
      setTotalUnread(buyerUnreadCount + sellerUnreadCount);
    }, () => {});

    return () => {
      unsubscribeBuyer();
      unsubscribeSeller();
    };
  }, [currentUserId]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === "Home") icon = "home";
          if (route.name === "Chat") icon = "chatbubble-outline";
          if (route.name === "Favorites") icon = "heart-outline";
          if (route.name === "Profile") icon = "person-outline";

          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 6,
          height: 60,
        },
        tabBarBadge: route.name === "Chat" && totalUnread > 0 ? totalUnread : undefined,
        tabBarBadgeStyle: {
          backgroundColor: '#FF3B30',
          color: '#fff',
          fontSize: 12,
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          lineHeight: 18,
        },
      })}
    >
      <Tab.Screen name="Home" component={ProductListPage} />
      <Tab.Screen name="Chat" component={ChatPage} />
      <Tab.Screen name="Favorites" component={FavouritesPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}