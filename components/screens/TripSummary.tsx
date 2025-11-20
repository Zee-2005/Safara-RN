import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Feather } from "@expo/vector-icons";

type TripSummary = {
  startNow?: boolean;
  startDate?: string;
  endDate?: string;
  homeCity?: string;
};

interface TripSummaryModalProps {
  visible: boolean;
  summary?: TripSummary | null;
  onClose: () => void;
  onProceed: () => void;
}

export default function TripSummaryModal({ visible, summary, onClose, onProceed }: TripSummaryModalProps) {
  if (!summary) return null;
  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
      animationType="slide"
    >
      <View style={styles.bg}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Trip Summary</Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: "auto" }}>
              <Feather name="x" size={22} />
            </TouchableOpacity>
          </View>
          <Card style={{ padding: 14 }}>
            <Text style={styles.label}>Start:</Text>
            <Text style={styles.value}>{summary.startNow ? "Now" : summary.startDate}</Text>
            <Text style={styles.label}>End:</Text>
            <Text style={styles.value}>{summary.endDate}</Text>
            <Text style={styles.label}>Hometown:</Text>
            <Text style={styles.value}>{summary.homeCity}</Text>
            {/* Add more fields as needed */}
            <Button style={{ marginTop: 20 }} onPress={onProceed}>
              Proceed to generate Tourist ID
            </Button>
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 18,
    ...Platform.select({ android: { elevation: 6 } }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 14,
  },
  modalTitle: {
    fontWeight: "700", fontSize: 18,
  },
  label: { color: "#6b7280", fontSize: 12, marginTop: 12, marginBottom: 2 },
  value: { color: "#1e293b", fontWeight: "600", fontSize: 16 },
});
