import React, { useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Label from "../ui/Label";
import Badge from "../ui/Badge";
import { Progress } from "../ui/Progress";
import { Feather } from "@expo/vector-icons";
import { registerBasic } from "../../lib/pid";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PersonalIdCreationProps {
  onComplete: (idData: any) => void;
  onBack: () => void;
}

export default function PersonalIdCreation({ onComplete, onBack }: PersonalIdCreationProps) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 1;
  const progress = 100;

  const valid =
    fullName.trim().length >= 3 &&
    /^\d{10}$/.test(mobile) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!valid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await registerBasic(fullName.trim(), mobile.trim(), email.trim());
      setApplicationId(res.applicationId);

      // Store values using AsyncStorage
      await AsyncStorage.setItem("pid_application_id", res.applicationId);
      await AsyncStorage.setItem("pid_full_name", fullName.trim());
      await AsyncStorage.setItem("pid_mobile", mobile.trim());
      await AsyncStorage.setItem("pid_email", email.trim());

      onComplete({
        applicationId: res.applicationId,
        status: res.status,
        submittedAt: res.createdAt,
        fullName,
        mobile,
        email,
      });
      // Navigation to doc upload handled by parent (or onComplete)
    } catch (e: any) {
      setError(e?.message || "Failed to start Personal ID application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F3F4F6" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ backgroundColor: "#FFF", paddingTop: insets.top, borderBottomWidth: 1, borderColor: "#e5e7eb", padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Button variant="ghost" onPress={onBack}>
              <Feather name="arrow-left" size={22} />
            </Button>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Create Personal ID</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>Step 1 of {totalSteps}</Text>
                <Badge variant="secondary" style={{ marginLeft: 8 }}>KYC Required</Badge>
              </View>
            </View>
          </View>
        <View style={{ marginTop: 12 }}>
          <Progress value={progress} />
        </View>
      </View>

      <View style={{ padding: 18 }}>
        <Card style={{ padding: 18, marginBottom: 12 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>Basic details</Text>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>
              Enter the details exactly as they appear on Aadhaar or your government ID.
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Label>Full Name</Label>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                backgroundColor: "#fff",
                borderRadius: 7,
                paddingHorizontal: 10,
                paddingVertical: 10,
                marginBottom: 10,
              }}
              placeholder="As per Aadhaar/Government ID"
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <Label>Mobile Number</Label>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                borderTopLeftRadius: 7,
                borderBottomLeftRadius: 7,
                paddingHorizontal: 12,
                height: 43,
                justifyContent: "center"
              }}>
                <Text style={{ color: "#6b7280", fontSize: 15 }}>+91</Text>
              </View>
              <TextInput
                value={mobile}
                keyboardType="numeric"
                onChangeText={txt => setMobile(txt.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  backgroundColor: "#fff",
                  borderTopRightRadius: 7,
                  borderBottomRightRadius: 7,
                  paddingHorizontal: 10,
                  height: 43,
                  flex: 1,
                }}
                placeholder="10-digit mobile number"
              />
            </View>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Label>Email ID</Label>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                backgroundColor: "#fff",
                borderRadius: 7,
                paddingHorizontal: 10,
                paddingVertical: 10,
                marginBottom: 10,
              }}
              placeholder="name@example.com"
            />
          </View>

          {error && (
            <View style={{
              backgroundColor: "#fee2e2",
              borderWidth: 1,
              borderColor: "#fecaca",
              borderRadius: 6,
              padding: 8,
              marginBottom: 8
            }}>
              <Text style={{ color: "#dc2626", fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <Button
            onPress={handleSubmit}
            disabled={!valid || isSubmitting}
            style={{ marginTop: 6 }}
          >
            {isSubmitting ? "Creating application…" : "Continue"}
          </Button>
        </Card>

        <Card style={{ backgroundColor: "#f3f4f6", padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Feather name="shield" size={18} color="#246BFD" style={{ marginRight: 8, marginTop: 4 }} />
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              We only create a temporary application at this step; document verification happens next.
            </Text>
          </View>
          {applicationId && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 12 }}>
                Application ID: <Text style={{ fontFamily: "monospace" }}>{applicationId}</Text>
              </Text>
            </View>
          )}
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}
