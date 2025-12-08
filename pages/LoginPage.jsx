// pages/LoginPage.jsx
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
import { logIn, resendVerificationEmail } from "../firebase/auth";

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Validation Error", "Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await logIn(email.trim(), password.trim());
      navigation.replace("MainApp");
    } catch (err) {
      // 1. EMAIL NOT VERIFIED
      if (err.code === "auth/email-not-verified") {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in.",
          [
            { text: "OK", style: "cancel" },
            {
              text: "Resend Verification",
              onPress: async () => {
                try {
                  await resendVerificationEmail(email.trim(), password.trim());
                  Alert.alert("Verification Sent", "Please check your inbox.");
                } catch (e) {
                  Alert.alert("Error", e.message || "Failed to resend verification email.");
                }
              }
            }
          ]
        );
        setLoading(false);
        return;
      }

      // 2. INVALID CREDENTIALS (wrong password OR user not found)
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        Alert.alert(
          "Invalid Credentials",
          "The email or password you entered is incorrect. If you don't have an account, please sign up.",
          [
            { text: "Try Again", style: "cancel" },
            {
              text: "Sign Up",
              onPress: () => navigation.navigate("SignupPage")
            }
          ]
        );
        setLoading(false);
        return;
      }

      // 4. INVALID EMAIL
      else if (err.code === "auth/invalid-email") {
        Alert.alert("Invalid Email", "Please check your email address.");
      }

      // 5. TOO MANY ATTEMPTS
      else if (err.code === "auth/too-many-requests") {
        Alert.alert("Too Many Attempts", "Please try again later.");
      }

      // 6. DEFAULT ERROR
      else {
        Alert.alert("Login Error", err.message || "Failed to log in.");
      }
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield" size={50} color="#666" />
            </View>
            <Text style={styles.appTitle}>BadgerSwap</Text>
            <Text style={styles.tagline}>Trusted marketplace for UW-Madison</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
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
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Log In</Text>}
            </TouchableOpacity>

            {/* Signup Redirect */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignupPage")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  logoContainer: { alignItems: "center", marginTop: 60, marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  appTitle: { fontSize: 28, fontWeight: "bold" },
  tagline: { fontSize: 14, color: "#666" },
  formContainer: { width: "100%" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
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
