import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  onBack: () => void;
  onShowQr: () => void;
}

export default function PersonalIdDetails({ onBack, onShowQr }: Props) {
  const [personalId, setPersonalId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [mobile, setMobile] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setPersonalId(await AsyncStorage.getItem("pid_personal_id"));
      setFullName(await AsyncStorage.getItem("pid_full_name"));
      setMobile(await AsyncStorage.getItem("pid_mobile"));
      setEmail(await AsyncStorage.getItem("pid_email"));
    })();
  }, []);

  const copy = async (v?: string | null) => {
    if (v) {
      await AsyncStorage.setItem("copied_to_clipboard", v); // for debug, but ideally use 'expo-clipboard'
      Alert.alert("Copied", `${v}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={onBack}>
          <Feather name="arrow-left" size={22} />
        </Button>
        <Text style={styles.headerTitle}>Personal ID</Text>
      </View>
      <View style={{ padding: 18 }}>
        <Card style={{ padding: 18 }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Digital Personal ID</Text>
            <Badge variant="secondary" style={styles.badgeVerified}>
              <Feather name="check-circle" size={17} color="#22c55e" />
              <Text style={styles.verifiedText}>Verified</Text>
            </Badge>
          </View>
          <View style={{ marginTop: 12 }}>
            <DetailRow label="Personal ID">
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.mono}>{personalId || "—"}</Text>
                <TouchableOpacity onPress={() => copy(personalId)}>
                  <Feather name="copy" size={18} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </DetailRow>
            <DetailRow label="Name">
              <Text>{fullName || "—"}</Text>
            </DetailRow>
            <DetailRow label="Mobile">
              <Text>{mobile || "—"}</Text>
            </DetailRow>
            <DetailRow label="Email">
              <Text>{email || "—"}</Text>
            </DetailRow>
          </View>
          <View style={{ marginTop: 28 }}>
            <Button variant="outline" onPress={onShowQr}>
              <Feather name="maximize-2" size={20} style={{ marginRight: 8 }} /> Show QR
            </Button>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

// Helper to show label/value in row
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}</Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  badgeVerified: { flexDirection: "row", alignItems: "center", marginLeft: 10 },
  verifiedText: { marginLeft: 3, color: "#22c55e", fontWeight: "600" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { color: "#6b7280", fontSize: 14, marginRight: 8 },
  mono: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontSize: 14 }
});
