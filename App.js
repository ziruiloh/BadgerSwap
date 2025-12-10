// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import LoginPage from "./pages/LoginPage";
import ProductListPage from "./pages/ProductListPage"; // your Home
import SignupPage from "./pages/SignupPage";

const Stack = createStackNavigator();
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginPage"
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: "#FFFFFF" } }}
      >
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="SignupPage" component={SignupPage} />
        <Stack.Screen name="HomePage" component={ProductListPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
