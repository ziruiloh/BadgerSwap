// pages/SignupPage.jsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "../firebase/auth";

export default function SignupPage({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email.");
      return;
    }
    if (!email.toLowerCase().endsWith("@wisc.edu")) {
      Alert.alert("Error", "Only UW–Madison @wisc.edu emails can register.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter a password.");
      return;
    }

    setLoading(true);

    try {
      await signUp(email.trim(), password.trim(), name.trim());

      Alert.alert(
        "Verification Email Sent",
        `A verification email has been sent to ${email}. Please verify before logging in.`,
        [
          { text: "OK", onPress: () => navigation.navigate("LoginPage") }
        ]
      );
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        Alert.alert("Error", "This email is already registered.");
      } else {
        Alert.alert("Signup Error", err.message || "Failed to create account.");
      }
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add-outline" size={50} color="#666" />
            </View>
            <Text style={styles.appTitle}>Create Account</Text>
            <Text style={styles.tagline}>Join the UW–Madison marketplace</Text>
          </View>

          <View style={styles.formContainer}>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="youremail@wisc.edu"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("LoginPage")}>
                <Text style={styles.signupLink}> Log In</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  logoContainer: { alignItems: "center", marginTop: 60, marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  appTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  tagline: { fontSize: 14, color: "#666" },
  formContainer: { width: "100%" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: "500" },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1, borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  eyeIcon: { padding: 4 },

  primaryButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  signupContainer: { flexDirection: "row", justifyContent: "center" },
  signupText: { fontSize: 14, color: "#666" },
  signupLink: { fontSize: 14, color: "#000", fontWeight: "600", textDecorationLine: "underline" }
});
