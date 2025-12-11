import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { auth } from "./firebase/config";
import ChatPage from "./pages/ChatPage";
import EditListing from "./pages/EditListing";
import EditProfile from "./pages/EditProfile";
import FavouritesPage from "./pages/FavouritesPage";
import ListingDetails from "./pages/ListingDetails";
import LoginPage from "./pages/LoginPage";
import MyListingsPage from "./pages/MyListingsPage";
import PostListing from "./pages/PostListing";
import ProductListPage from "./pages/ProductListPage";
import ProfilePage from "./pages/ProfilePage";
import ReportPage from "./pages/ReportPage";
import SignupPage from "./pages/SignupPage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// HomeTabs renders the bottom tab navigator used after authentication
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Chat") {
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          } else if (route.name === "Favorites") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size || 24} color={color} />;
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#666666",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
          paddingBottom: 15,
          paddingTop: 8,
          height: 75,
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

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Could add a splash screen here
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={user ? "MainApp" : "LoginPage"}
          screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#FFFFFF" } }}
        >
          {/* Auth screens */}
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="SignupPage" component={SignupPage} />

          {/* Main authenticated container (tab navigator) */}
          <Stack.Screen name="MainApp" component={HomeTabs} />

          {/* Detail + creation flows layered on top of tabs */}
          <Stack.Screen name="ListingDetails" component={ListingDetails} />
          <Stack.Screen name="PostListing" component={PostListing} />
          <Stack.Screen name="EditListing" component={EditListing} />
          <Stack.Screen name="ReportPage" component={ReportPage} />
          <Stack.Screen name="MyListingsPage" component={MyListingsPage} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
