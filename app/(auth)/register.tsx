import ScreenLayout from "@/components/ScreenLayout";
import Colors, { ColorScheme } from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Feather, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "yooo-native";
import { useAuth } from "../../context/ctx";

export default function Register() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const theme = useCurrentTheme();
  const colors = Colors[theme.colorScheme];
  const styles = getStyles(theme.colorScheme);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }

    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    if (!password) {
      toast.error("Please enter a password");
      return false;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!agreeToTerms) {
      toast.warning("Please agree to the Terms of Service and Privacy Policy");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim(),
      });

      // Show success message and navigate to verification
      toast.success(
        "Welcome! Please check your email for verification instructions",
      );

      // Navigate to login after a brief delay
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);
    } catch (error) {
      // Error alert handled in API class, but we can add custom handling
      toast.error("Registration failed. Please try again or contact support");
    }
  };

  const handleSignIn = () => {
    router.push("/(auth)/login");
  };

  return (
    <ScreenLayout>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#00000003", "#53535306"]}
                  style={styles.logoCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Image
                  style={styles.iconImage}
                  source={require("@/assets/images/android/play_store_512.png")}
                />
                <Text style={styles.logoText}>expo</Text>
              </View>

              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Get started in minutes</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Create a password (min. 6 characters)"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={theme.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Confirm your password"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <Feather
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={theme.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.border,
                      backgroundColor: agreeToTerms ? theme.primary : "transparent",
                    },
                  ]}
                >
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxText}>I agree to the </Text>
                  <Pressable
                    onPress={() => router.push("/(auth)/terms")}
                    style={styles.linkPressable}
                  >
                    <Text style={styles.linkText}>Terms of Service</Text>
                  </Pressable>
                  <Text style={styles.checkboxText}> and </Text>
                  <Pressable
                    onPress={() => router.push("/(auth)/terms")}
                    style={styles.linkPressable}
                  >
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Pressable>
                </View>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Register Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.buttonBackground]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Text>
                  {!isLoading && (
                    <View style={styles.buttonArrow}>
                      <Entypo name="chevron-right" size={20} color={theme.buttonText} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              {/* Sign In Link */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>
                  Already have an account?{" "}
                  <Text style={styles.linkText}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const getStyles = (colorScheme: ColorScheme) => {
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  return StyleSheet.create({
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  patternCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    top: -100,
    right: -50,
  },
  patternCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    bottom: 100,
    left: -75,
  },
  patternCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? '#151515' : '#fafafa',
    top: "35%",
    right: 30,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconImage: {
    position: "absolute",
    width: 64,
    borderRadius: 32,
    height: 64,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "200",
    letterSpacing: 6,
    color: colors.text,
    textTransform: "uppercase",
    fontFamily: 'Inter_400Regular',
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
    fontWeight: "400",
    fontFamily: 'Inter_400Regular',
  },
  form: {
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.buttonText,
    fontFamily: 'Inter_400Regular',
  },
  checkboxTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
    fontFamily: 'Inter_400Regular',
  },
  linkPressable: {
    marginHorizontal: 2,
  },
  actions: {
    gap: 20,
  },
  primaryButton: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.buttonText,
    letterSpacing: 1,
    marginRight: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.secondary,
    fontFamily: 'Inter_400Regular',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    color: colors.secondary,
    fontFamily: 'Inter_400Regular',
  },
  linkText: {
    color: colors.text,
    fontWeight: "600",
    textDecorationLine: "underline",
    fontFamily: 'Inter_600SemiBold',
  },
});
};
