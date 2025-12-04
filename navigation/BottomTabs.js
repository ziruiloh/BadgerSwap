import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ChatPage from "../pages/ChatPage";
import FavouritesPage from "../pages/FavouritesPage";
import ProductListPage from "../pages/ProductListPage";
import ProfilePage from "../pages/ProfilePage";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
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
        tabBarStyle: {
          paddingBottom: 12,
          paddingTop: 8,
          height: 68,
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