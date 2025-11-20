import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable,KeyboardAvoidingView, Platform } from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons, FontAwesome } from "@expo/vector-icons";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Label from "../ui/Label";
import { loginEmail, signup, requestOtp, verifyOtp } from "../../lib/auth";


type AuthMode = "login" | "signup";
type Step = "choose" | "phone" | "otp";

interface AuthScreenProps {
  onLogin: (phoneOrEmail: string) => void;
  onGuestMode: () => void;
}

export default function AuthScreen({ onLogin, onGuestMode }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reqId, setReqId] = useState<string | null>(null);

  function Tabs() {
    return (
      <View style={styles.tabsList}>
        <Pressable style={[styles.tabsTrigger, mode === "login" && styles.tabsActive]} onPress={() => setMode("login")}>
          <Text style={styles.tabsLabel}>Login</Text>
        </Pressable>
        <Pressable style={[styles.tabsTrigger, mode === "signup" && styles.tabsActive]} onPress={() => setMode("signup")}>
          <Text style={styles.tabsLabel}>Sign Up</Text>
        </Pressable>
      </View>
    );
  }

  const startPhoneFlow = () => setStep("phone");

  const handleSendOtp = async () => {
    try {
      if (phone.length !== 10) return;
      setIsLoading(true);
      const { requestId: rId } = await requestOtp(phone);
      setReqId(rId);
      setStep("otp");
    } catch (e: any) {
      alert(e.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!reqId || otp.length !== 6) return;
      setIsLoading(true);
      const u = await verifyOtp(reqId, otp);
      onLogin(u.phone || u.email || "");
    } catch (e: any) {
      alert(e.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    try {
      setIsLoading(true);
      if (mode === "signup") {
        const u = await signup(email, pass);
        onLogin(u.email || u.phone || "");
      } else {
        const u = await loginEmail(email, pass);
        onLogin(u.email || u.phone || "");
      }
    } catch (e: any) {
      alert(e.message || "Auth error");
    } finally {
      setIsLoading(false);
    }
  };

  const continueWithGoogle = () => {
    alert("Google sign-in coming soon");
  };

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.logoRow}>
        <View style={styles.logoCircle}>
          <Feather name="shield" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>SaFara</Text>
        <Text style={styles.subhead}>Secure sign in to access safety features</Text>
      </View>
      <Card>
        {step === "choose" && (
          <>
            <Tabs />
            {mode === "login" && (
              <>
                <Button onPress={continueWithGoogle} variant="secondary">
                  <FontAwesome name="google" size={18} color="#DB4437" />  Continue with Google
                </Button>
                <Button onPress={startPhoneFlow} variant="outline">
                  <Feather name="smartphone" size={18} color="#246BFD" />  Continue with phone
                </Button>
                <View style={styles.divider} />
                <Label>Email</Label>
                <Input
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Label>Password</Label>
                <Input
                  placeholder="••••••••"
                  value={pass}
                  onChangeText={setPass}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Button onPress={handleEmailSubmit} disabled={!email || pass.length < 6 || isLoading} loading={isLoading}>
                  Login
                </Button>
              </>
            )}
            {mode === "signup" && (
              <>
                <Label>Email</Label>
                <Input
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Label>Password (min 6 chars)</Label>
                <Input
                  placeholder="Create a password"
                  value={pass}
                  onChangeText={setPass}
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Button onPress={handleEmailSubmit} disabled={!email || pass.length < 6 || isLoading} loading={isLoading}>
                  Create account
                </Button>
                <Button variant="ghost" onPress={() => setMode("login")}>
                  Already have an account? Login
                </Button>
              </>
            )}
          </>
        )}

        {step === "phone" && (
          <>
            <Button variant="ghost" onPress={() => setStep("choose")}>
              <Feather name="arrow-left" size={18} color="#246BFD" />   Back
            </Button>
            <Label>Mobile number</Label>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.codePrefix}>
                <Text style={styles.codeText}>+91</Text>
              </View>
              <Input
                placeholder="9876543210"
                value={phone}
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={(text) => setPhone(text.replace(/\D/g, "").slice(0, 10))}
                style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </View>
            <Button onPress={handleSendOtp} disabled={phone.length !== 10 || isLoading} loading={isLoading}>
              Send OTP
            </Button>
          </>
        )}

        {step === "otp" && (
          <>
            <Button variant="ghost" onPress={() => setStep("phone")}>
              <Feather name="arrow-left" size={18} color="#246BFD" />   Change number
            </Button>
            <Label>Verification code</Label>
            <Input
              placeholder="123456"
              value={otp}
              maxLength={6}
              keyboardType="number-pad"
              onChangeText={(text) => setOtp(text.replace(/\D/g, "").slice(0, 6))}
              style={{
                textAlign: "center",
                fontSize: 20,
                letterSpacing: 14,
              }}
            />
            <Text style={styles.otpSent}>
              Code sent to +91 {phone}
            </Text>
            <Button onPress={handleVerifyOtp} disabled={otp.length !== 6 || isLoading} loading={isLoading}>
              Verify & Continue
            </Button>
          </>
        )}
      </Card>

      <View style={{ alignItems: "center" }}>
        <Button variant="outline" onPress={onGuestMode}>
          <Ionicons name="person-circle-outline" size={21} color="#246BFD" />   Continue as Guest
        </Button>
        <Text style={styles.guestInfo}>Guest mode lets you browse safety information only</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons name="earth" size={11} color="#6B7280" />
          <Text style={styles.availableLang}>Available in multiple languages</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: "#f8fbff",
    alignItems: "stretch",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 18,
  },
  logoRow: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#246BFD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subhead: { fontSize: 14, color: "#6B7280", marginTop: 2, marginBottom: 3, textAlign: "center" },
  // Tabs
  tabsList: { flexDirection: "row", marginBottom: 14, backgroundColor: "#E7F0FF", borderRadius: 8, overflow: "hidden" },
  tabsTrigger: { flex: 1, paddingVertical: 11, alignItems: "center", backgroundColor: "#E7F0FF" },
  tabsActive: { backgroundColor: "#246BFD" },
  tabsLabel: { color: "#246BFD", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  codePrefix: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB", borderWidth: 1, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  codeText: { color: "#246BFD", fontSize: 15, fontWeight: "600" },
  otpSent: { fontSize: 13, color: "#6B7280", marginTop: 8, marginBottom: 4, textAlign: "center" },
  guestInfo: { marginTop: 6, fontSize: 11, color: "#6B7280", textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 3 },
  availableLang: { marginLeft: 4, color: "#6B7280", fontSize: 10 },
});
