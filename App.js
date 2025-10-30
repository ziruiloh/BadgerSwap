// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import LoginPage from "./pages/LoginPage";
import ProductListPage from "./pages/ProductListPage"; // your Home
import SignupPage from "./pages/SignupPage";

const Stack = createStackNavigator();

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
