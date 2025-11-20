import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Card from "../ui/Card"; // Substitute your design Card, or use View with styles
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Feather } from "@expo/vector-icons";

interface Props {
  onBack: () => void;
  onNavigate: (key: "agencies" | "ai" | "direct") => void;
}

export default function PlanTripHub({ onBack, onNavigate }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top", "left", "right"]}>
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      {/* Header */}
      <View style={styles.header}>
        <Button variant="ghost" onPress={onBack}>
          <Feather name="arrow-left" size={23} />
        </Button>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerText}>Plan your trip</Text>
          <Text style={styles.headerDesc}>
            Choose how to plan your time-bound journey, then generate a Tourist ID.
          </Text>
        </View>
      </View>

      {/* Cards */}
      <ScrollView contentContainerStyle={styles.cardGrid}>
        {/* 1: Agencies */}
<Card style={styles.card}>
  <View style={styles.rowSpace}>
    <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
      <View style={[styles.iconBox, { backgroundColor: "#bbf7d0" }]}>
        <Feather name="home" size={20} color="#22c55e" />
      </View>

      {/* 🔥 Add flexShrink + maxWidth */}
      <View style={{ marginLeft: 10, flexShrink: 1, maxWidth: "80%" }}>
        <Text style={styles.cardTitle}>Browse trusted agencies</Text>
        <Text style={styles.cardDesc}>
          Curated operators, safe itineraries, transparent pricing.
        </Text>
      </View>
    </View>

    {/* Badge will stay on right without forcing overflow */}
    <Badge variant="secondary">Recommended</Badge>
  </View>

  <Button style={{ marginTop: 18 }} onPress={() => onNavigate("agencies")}>
    Explore agencies <Feather name="chevron-right" size={17} style={{ marginLeft: 6 }} />
  </Button>
</Card>

        {/* 2: AI Planning */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: "#fef9c3" }]}>
              <Feather name="sun" size={20} color="#fbbf24" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Personalised trip with AI</Text>
              <Text style={styles.cardDesc}>
                Get a tailored itinerary with safety guidance.
              </Text>
            </View>
          </View>
          <View style={styles.soonBox}>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>
              Coming soon — AI‑assisted routes, activities, and live safety insights.
            </Text>
          </View>
        </Card>

        {/* 3: Direct ID */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: "#fee2e2" }]}>
              <Feather name="send" size={20} color="#ef4444" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cardTitle}>Direct Tourist ID</Text>
              <Text style={styles.cardDesc}>
                Set dates and go — we’ll skip hometown as destination.
              </Text>
            </View>
          </View>
          <Button variant="secondary" style={{ marginTop: 18 }}
            onPress={() => onNavigate("direct")}>
            Generate quickly <Feather name="chevron-right" size={17} style={{ marginLeft: 6 }} />
          </Button>
        </Card>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff", padding: 16, borderBottomWidth: 1, borderColor: "#e5e7eb",
    flexDirection: "row", alignItems: "center"
  },
  headerText: { fontWeight: "bold", fontSize: 20 },
  headerDesc: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  cardGrid: { padding: 18, gap: 16 },
  card: { padding: 16, borderRadius: 14, marginBottom: 12, backgroundColor: "#fff" },
  cardTitle: { fontWeight: "600", fontSize: 16 },
  cardDesc: { fontSize: 13, color: "#6b7280" },
  soonBox: { marginTop: 18, borderRadius: 8, backgroundColor: "#f2f2f2", padding: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  rowSpace: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
