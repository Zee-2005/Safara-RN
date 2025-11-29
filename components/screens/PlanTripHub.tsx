// src/components/screens/PlanTripHub.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

type PlanSection = "agencies" | "direct" | "ai";

interface Props {
  onBack: () => void;
  onNavigate: (section: PlanSection) => void;
}

export default function PlanTripHub({ onBack, onNavigate }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Plan your trip</Text>
          <Text style={styles.headerSubtitle}>
            Choose how to plan your time-bound journey, then generate a Tourist ID.
          </Text>
        </View>
      </View>

      <View style={styles.cardGrid}>
        {/* 1. Agencies */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: "rgba(22,163,74,0.1)" }]}>
                <Text style={[styles.iconText, { color: "#16a34a" }]}>A</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Browse trusted agencies</Text>
                <Text style={styles.cardSubtitle}>
                  Curated operators, safe itineraries, transparent pricing.
                </Text>
              </View>
            </View>
            <Badge variant="secondary">Recommended</Badge>
          </View>
          <View style={styles.cardFooter}>
            <Button onPress={() => onNavigate("agencies")}>
              <Text style={styles.buttonText}>Explore agencies →</Text>
            </Button>
          </View>
        </Card>

        {/* 2. AI planning */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(234,179,8,0.1)" }]}>
              <Text style={[styles.iconText, { color: "#eab308" }]}>AI</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Personalised trip with AI</Text>
              <Text style={styles.cardSubtitle}>
                Get a tailored itinerary with safety guidance.
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.comingSoonBox}>
              <Text style={styles.comingSoonText}>
                Coming soon — AI‑assisted routes, activities, and live safety insights.
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. Direct ID */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(248,113,113,0.1)" }]}>
              <Text style={[styles.iconText, { color: "#ef4444" }]}>D</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Direct Tourist ID</Text>
              <Text style={styles.cardSubtitle}>
                Set dates and go — destination will skip hometown.
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Button variant="secondary" onPress={() => onNavigate("direct")}>
              <Text style={styles.buttonText}>Generate quickly →</Text>
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: "#f3f4f6" },
  backText: { fontSize: 16 },
  headerTextWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  cardGrid: { padding: 16, rowGap: 16 },
  card: { padding: 16, borderRadius: 12, backgroundColor: "#ffffff" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontWeight: "700" },
  cardTitle: { fontWeight: "600", fontSize: 15 },
  cardSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2, maxWidth: 220 },
  cardFooter: { marginTop: 16 },
  comingSoonBox: { padding: 10, borderRadius: 8, backgroundColor: "#f3f4f6" },
  comingSoonText: { fontSize: 12, color: "#4b5563" },
  buttonText: { color: "#ffffff", fontWeight: "600" },
});
