import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Switch, Platform } from "react-native";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Label from "../ui/Label";
import { TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { saveTripDraft } from "../../lib/trip";

interface Props {
  userEmail: string;
  onBack: () => void;
  onProceed: () => void;
}

export default function DirectIdQuick({ userEmail, onBack, onProceed }: Props) {
  const [startNow, setStartNow] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [homeCity, setHomeCity] = useState("");

  const valid =
    (startNow || !!start) && !!end && !!homeCity;

  async function proceed() {
    await saveTripDraft(userEmail, {
      mode: "direct",
      startNow,
      startDate: startNow
        ? new Date().toISOString().slice(0, 10)
        : start || null,
      endDate: end || null,
      destination: "",
      itinerary: null,
      agencyId: null,
      homeCity
    });
    onProceed();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top", "left", "right"]}>
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={onBack}>
          <Feather name="arrow-left" size={22} />
        </Button>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerText}>Direct Tourist ID</Text>
          <Text style={styles.headerDesc}>
            Set trip duration and hometown; destination will exclude hometown.
          </Text>
        </View>
      </View>

      <View style={{ padding: 18 }}>
        <Card style={{ padding: 18 }}>
          <View style={styles.sectionHeader}>
            <Feather name="calendar" size={18} color="#2563eb" style={{ marginRight: 5 }} />
            <Text style={styles.sectionTitle}>Time window</Text>
            <Badge variant="secondary" style={{ marginLeft: 7 }}>Required</Badge>
          </View>

          <View style={[styles.row, { marginBottom: 12 }]}>
            <Switch
              value={startNow}
              onValueChange={setStartNow}
              style={{ marginRight: 8 }}
            />
            <Label style={{ marginLeft: 3 }}>Start right now</Label>
          </View>
          <View style={[styles.row, { gap: 10, marginBottom: 16 }]}>
            <View style={{ flex: 1 }}>
              <Label style={{ marginLeft: 3 }}>Start Date</Label>
              <TextInput
                style={styles.input}
                editable={!startNow}
                value={start}
                placeholder="YYYY-MM-DD"
                onChangeText={setStart}
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label style={{ marginLeft: 3 }}>End date</Label>
              <TextInput
                style={styles.input}
                value={end}
                placeholder="YYYY-MM-DD"
                onChangeText={setEnd}
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Feather name="home" size={18} color="#ef4444" style={{ marginRight: 5 }} />
            <Text style={styles.sectionTitle}>Hometown</Text>
            <Badge variant="outline" style={{ marginLeft: 7 }}>Required</Badge>
          </View>
          <View>
            <Label style={{ marginLeft: 3 }}>City / Town</Label>
            <TextInput
              style={styles.input}
              value={homeCity}
              placeholder="e.g., Bengaluru"
              onChangeText={setHomeCity}
            />
          </View>

          <View style={{ marginTop: 18, flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onPress={proceed} disabled={!valid}>Proceed to summary</Button>
          </View>
        </Card>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center"
  },
  headerText: { fontWeight: "bold", fontSize: 19 },
  headerDesc: { fontSize: 13, color: "#6b7280" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  sectionTitle: { fontWeight: "600", fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    fontSize: 15,
    marginBottom: 9
  }
});
