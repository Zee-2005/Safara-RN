// components/screens/TripSummary.tsx
// Flexible summary for "agencies" and "direct" trip modes

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

export type TripMode = "agencies" | "direct" | "ai";

export type TripSummaryData = {
  mode: TripMode;
  startNow?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  destination?: string | null;
  itinerary?: string | null;
  agencyId?: string | null;
  homeCity?: string | null;
};

type Props = {
  visible: boolean;
  summary: TripSummaryData;
  onClose: () => void;
  onProceed: () => void;
};

export default function TripSummary({
  visible,
  summary,
  onClose,
  onProceed,
}: Props) {
  const {
    mode,
    startNow,
    startDate,
    endDate,
    destination,
    itinerary,
    agencyId,
    homeCity,
  } = summary;

  const startLabel =
    mode === "direct"
      ? startNow
        ? "Right now"
        : startDate || "—"
      : startDate || "—";

  const endLabel = endDate || "—";

  const destinationLabel =
    mode === "agencies"
      ? destination || "—"
      : destination || "Auto-assign (not hometown)";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Trip summary</Text>
            <Badge>
              <Text style={styles.badgeText}>{mode.toUpperCase()}</Text>
            </Badge>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {/* Common fields */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Start</Text>
                <Text style={styles.value}>{startLabel}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>End</Text>
                <Text style={styles.value}>{endLabel}</Text>
              </View>
            </View>

            {/* Mode-specific sections */}
            {mode === "direct" && (
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Hometown</Text>
                  <Text style={styles.value}>{homeCity || "—"}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Destination</Text>
                  <Text style={styles.value}>{destinationLabel}</Text>
                </View>
              </View>
            )}

            {mode === "agencies" && (
              <>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Destination</Text>
                    <Text style={styles.value}>{destinationLabel}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>Agency</Text>
                    <Text style={styles.value}>{agencyId || "—"}</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Planned visits / itinerary</Text>
                  <View style={styles.itineraryBox}>
                    <Text style={styles.itineraryText}>
                      {itinerary || "—"}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {mode === "ai" && (
              <View style={styles.section}>
                <Text style={styles.label}>AI itinerary</Text>
                <View style={styles.itineraryBox}>
                  <Text style={styles.itineraryText}>
                    {itinerary || "AI-generated plan will appear here."}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={onClose} style={styles.outlineButton}>
              <Text style={styles.outlineText}>Back</Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <Button onPress={onProceed}>
              <Text style={styles.buttonText}>Generate Tourist ID</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  body: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  col: {
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
