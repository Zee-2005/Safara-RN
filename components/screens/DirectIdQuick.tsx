// components/screens/DirectIdQuick.tsx
// Trip summary + Tourist ID generation inline (no separate summary screen)

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Label from "../ui/Label";

import { saveTripDraft } from "../../lib/trip";
import { createTrip } from "../../lib/tourist.service";

type TripMode = "agencies" | "direct" | "ai";

type TripSummaryData = {
  mode: TripMode;
  startNow?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  destination?: string | null;
  itinerary?: string | null;
  agencyId?: string | null;
  homeCity?: string | null;
};

interface Props {
  userEmail?: string;
  onBack: () => void;
  onProceed: () => void; // after trip created → go directly to docs
}

export default function DirectIdQuick({
  userEmail,
  onBack,
  onProceed,
}: Props) {
  const [startNow, setStartNow] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [homeCity, setHomeCity] = useState("");

  const [summaryVisible, setSummaryVisible] = useState(false);
  const [summary, setSummary] = useState<TripSummaryData | null>(null);
  const [creating, setCreating] = useState(false);

  const valid = (startNow || !!start) && !!end && !!homeCity;

  function openSummary() {
    const startDate = startNow
      ? new Date().toISOString().slice(0, 10)
      : start || null;
    const endDate = end || null;

    setSummary({
      mode: "direct",
      startNow,
      startDate,
      endDate,
      destination: "",
      itinerary: null,
      agencyId: null,
      homeCity: homeCity || null,
    });
    setSummaryVisible(true);
  }

  function closeSummary() {
    setSummaryVisible(false);
  }

  async function confirmSummary() {
    if (!summary) return;

    try {
      setCreating(true);

      const userKey = userEmail;
      if (!userKey) {
        Alert.alert("Login required", "Please log in again to continue.");
        return;
      }

      // PID applicationId as holderPid
      const candidateKeys = [
        `pid_application_id:${userKey}`,
        "pid_application_id",
      ];
      let pidApplicationId = "";
      for (const key of candidateKeys) {
        const v = await AsyncStorage.getItem(key);
        if (v) {
          pidApplicationId = v;
          break;
        }
      }

      if (!pidApplicationId) {
        Alert.alert(
          "Personal ID missing",
          "Personal ID not found. Please complete Personal ID first."
        );
        return;
      }

      const draft = {
        mode: "direct",
        startNow: summary.startNow,
        startDate: summary.startDate || null,
        endDate: summary.endDate || null,
        destination: "",
        itinerary: null,
        agencyId: null,
        homeCity: summary.homeCity || null,
      } as any;

      await saveTripDraft(userKey, draft);

      const startDate = summary.startDate || "";
      const endDate = summary.endDate || "";

      if (!startDate || !endDate) {
        Alert.alert(
          "Invalid dates",
          "Please ensure both start and end dates are set."
        );
        return;
      }

      const res = await createTrip({
        userId: userKey,
        holderPid: pidApplicationId,
        startDate,
        endDate,
        destination: "",
        itinerary: null,
        agencyId: null,
        homeCity: summary.homeCity || null,
        travelerType: "indian",
      });

      await AsyncStorage.setItem(`current_tid:${userKey}`, res.tid);
      await AsyncStorage.setItem(
        `current_tid_status:${userKey}`,
        res.status
      );

      setSummaryVisible(false);
      onProceed(); // parent: go straight to TouristIdDocs
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message || "Failed to create Tourist ID. Please try again."
      );
    } finally {
      setCreating(false);
    }
  }

  const startLabel =
    summary && summary.mode === "direct"
      ? summary.startNow
        ? "Right now"
        : summary.startDate || "—"
      : summary?.startDate || "—";

  const endLabel = summary?.endDate || "—";

  const destinationLabel =
    summary && summary.mode === "agencies"
      ? summary.destination || "—"
      : summary?.destination || "Auto-assign (not hometown)";

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Button variant="ghost" onPress={onBack}>
            <Text style={styles.backText}>←</Text>
          </Button>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Direct Tourist ID</Text>
            <Text style={styles.headerSubtitle}>
              Set trip duration and hometown; destination will exclude hometown.
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionIcon, { color: "#3b82f6" }]}>📅</Text>
              <Text style={styles.sectionTitle}>Time window</Text>
              <Badge variant="secondary">Required</Badge>
            </View>

            <View style={styles.timeGrid}>
              <View style={styles.row}>
                <Switch value={startNow} onValueChange={setStartNow} />
                <Text style={{ marginLeft: 8 }}>Start right now</Text>
              </View>

              <View style={styles.fieldCol}>
                <Label>Start date</Label>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={start}
                  onChangeText={setStart}
                  editable={!startNow}
                  style={[styles.input, startNow && styles.inputDisabled]}
                />
              </View>
              <View style={styles.fieldCol}>
                <Label>End date</Label>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={end}
                  onChangeText={setEnd}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={[styles.sectionIcon, { color: "#ef4444" }]}>🏠</Text>
              <Text style={styles.sectionTitle}>Hometown</Text>
              <Badge variant="outline">Required</Badge>
            </View>

            <View style={{ marginTop: 8 }}>
              <Label>City / Town</Label>
              <TextInput
                placeholder="e.g., Bengaluru"
                value={homeCity}
                onChangeText={setHomeCity}
                style={styles.input}
              />
            </View>

            <View style={styles.footer}>
              <Button onPress={openSummary} disabled={!valid}>
                <Text style={styles.buttonText}>Proceed to summary</Text>
              </Button>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Trip summary modal + Generate ID */}
      {summary && (
        <Modal visible={summaryVisible} animationType="slide" transparent>
          <View style={styles.overlay}>
            <View style={styles.modalCard}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Trip summary</Text>
                <Badge>
                  <Text style={styles.badgeText}>
                    {summary.mode.toUpperCase()}
                  </Text>
                </Badge>
              </View>

              <ScrollView contentContainerStyle={styles.bodyModal}>
                <View style={styles.rowModal}>
                  <View style={styles.colModal}>
                    <Text style={styles.label}>Start</Text>
                    <Text style={styles.value}>{startLabel}</Text>
                  </View>
                  <View style={styles.colModal}>
                    <Text style={styles.label}>End</Text>
                    <Text style={styles.value}>{endLabel}</Text>
                  </View>
                </View>

                {summary.mode === "direct" && (
                  <View style={styles.rowModal}>
                    <View style={styles.colModal}>
                      <Text style={styles.label}>Hometown</Text>
                      <Text style={styles.value}>
                        {summary.homeCity || "—"}
                      </Text>
                    </View>
                    <View style={styles.colModal}>
                      <Text style={styles.label}>Destination</Text>
                      <Text style={styles.value}>{destinationLabel}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.footerRow}>
                <TouchableOpacity
                  onPress={closeSummary}
                  style={styles.outlineButton}
                  disabled={creating}
                >
                  <Text style={styles.outlineText}>Back</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <Button onPress={confirmSummary} disabled={creating}>
                  <Text style={styles.buttonText}>
                    {creating ? "Creating…" : "Generate Tourist ID"}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  backText: { fontSize: 16 },
  headerTextWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  body: { padding: 16 },
  card: { padding: 16, borderRadius: 12, backgroundColor: "#ffffff" },
  sectionHeader: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontWeight: "600", fontSize: 15 },
  timeGrid: { marginTop: 12, rowGap: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  fieldCol: {},
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  inputDisabled: { backgroundColor: "#e5e7eb" },
  footer: { marginTop: 20, alignItems: "flex-end" },
  buttonText: { color: "#ffffff", fontWeight: "600" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.7)",
    padding: 16,
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: "#0B0B0B",
    padding: 16,
    maxHeight: "90%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
  },
  bodyModal: {
    paddingVertical: 4,
  },
  rowModal: {
    flexDirection: "row",
    marginBottom: 10,
  },
  colModal: {
    flex: 1,
    paddingRight: 8,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 2,
  },
  value: {
    color: "#F9FAFB",
    fontSize: 14,
  },
  section: {
    marginTop: 8,
  },
  itineraryBox: {
    marginTop: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  itineraryText: {
    color: "#D1D5DB",
    fontSize: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
  },
  outlineButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  outlineText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "500",
  },
});
