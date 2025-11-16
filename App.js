// App.js
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { Heart, Home, MessageCircle, User } from "react-native-feather";

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return null; // or a splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "MainApp" : "LoginPage"}
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#FFFFFF" } }}
      >
        {/* Always register both auth and main screens so navigation actions from auth screens
            (like navigation.replace('MainApp')) are handled. We control the start route via
            initialRouteName which uses the current `user` value. */}
        <Stack.Screen name="MainApp" component={HomeTabs} />
        <Stack.Screen name="ListingDetails" component={ListingDetails} />
        <Stack.Screen name="PostListing" component={PostListing} />

        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="SignupPage" component={SignupPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
