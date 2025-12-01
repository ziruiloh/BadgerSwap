// App.js
// Root application entry: sets up a stack navigator with an embedded bottom tab navigator.
// We always register both auth screens (Login/Signup) and the main app container (MainApp)
// so that navigation.replace('MainApp') is valid regardless of auth state. The initial route
// is chosen dynamically based on whether there's an authenticated Firebase user.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // bottom tab navigator (Home / Chat / Favorites / Profile)
import { NavigationContainer } from "@react-navigation/native"; // navigation context container
import { createStackNavigator } from "@react-navigation/stack"; // root stack (auth screens + MainApp)
import { useEffect, useState } from "react";
import { Heart, Home, MessageCircle, User } from "react-native-feather"; // simple feather icons for tab bar

import { auth } from "./firebase/config";
import ChatPage from "./pages/ChatPage";
import FavouritesPage from "./pages/FavouritesPage";
import ListingDetails from './pages/ListingDetails';
import LoginPage from "./pages/LoginPage";
import PostListing from './pages/PostListing';
import ProductListPage from "./pages/ProductListPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// HomeTabs renders the bottom tab navigator used after authentication.
// Each Tab.Screen hides the header and uses a consistent icon style.
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        
        tabBarIcon: ({ focused, color, size }) => {
          let Icon;
          if (route.name === "Home") {
            Icon = Home;
          } else if (route.name === "Chat") {
            Icon = MessageCircle;
          } else if (route.name === "Favorites") {
            Icon = Heart;
          } else if (route.name === "Profile") {
            Icon = User;
          }
          return Icon ? <Icon width={size || 24} height={size || 24} color={color} strokeWidth={2} /> : null;
        },
  // keep icon color consistent (no color change on active)
  tabBarActiveTintColor: "#000000",
  tabBarInactiveTintColor: "#000000",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      {/* Home (product listings grid) */}
      <Tab.Screen
        name="Home"
        component={ProductListPage}
        options={{
          title: "Home",
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            console.log('tabPress:', route.name);
          },
        })}
      />
      {/* Chat (placeholder local message list) */}
      <Tab.Screen
        name="Chat"
        options={{ title: "Chat" }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            console.log('tabPress:', route.name);
          },
        })}
      >
        {() => <ChatPage />}
      </Tab.Screen>
      {/* Favorites (placeholder favorites page) */}
      <Tab.Screen
        name="Favorites"
        options={{ title: "Favorites" }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            console.log('tabPress:', route.name);
          },
        })}
      >
        {() => <FavouritesPage />}
      </Tab.Screen>
      {/* Profile (user info / reputation) */}
      <Tab.Screen
        name="Profile"
        options={{ title: "Profile" }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            console.log('tabPress:', route.name);
          },
        })}
      >
        {() => <ProfilePage />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes to decide initial route
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    // Could render a splash/loading indicator here.
    return null; // Keep minimal for now.
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#FFFFFF" } }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen name="MainApp" component={HomeTabs} />
            <Stack.Screen name="ListingDetails" component={ListingDetails} />
            <Stack.Screen name="PostListing" component={PostListing} />
          </>
        ) : (
          // Auth screens (shown when logged out)
          <>
            <Stack.Screen name="LoginPage" component={LoginPage} />
            <Stack.Screen name="SignupPage" component={SignupPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
