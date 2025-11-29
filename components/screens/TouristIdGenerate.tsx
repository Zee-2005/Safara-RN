// src/components/screens/TouristIdGenerate.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

import { readTripDraft, TripDraft } from "../../lib/trip";
import { createTrip, TripResponse } from "../../lib/tourist.service";
import { useUserData } from "../../context/UserDataContext";

type Props = {
  userEmail: string;
  userId?: string;
  onBack?: () => void;
  onProceed?: () => void;
};

export default function TouristIdGenerate({
  userEmail,
  userId,
  onBack,
  onProceed,
}: Props) {
  const { updateTourist } = useUserData();

  const [trip, setTrip] = useState<TripDraft | null>(null);
  const [loading, setLoading] = useState(false);

  // Load trip draft for this user (email-scoped)
  useEffect(() => {
    let mounted = true;

    async function loadDraft() {
      try {
        const draft = await readTripDraft(userEmail);
        if (mounted) {
          setTrip(draft);
        }
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load trip draft");
      }
    }

    loadDraft();
    return () => {
      mounted = false;
    };
  }, [userEmail]);

  const startDateString =
    trip?.startNow && !trip?.startDate
      ? new Date().toISOString().slice(0, 10)
      : trip?.startDate || null;
  const endDateString = trip?.endDate || null;

  const startDateObj =
    startDateString != null ? new Date(startDateString) : null;
  const endDateObj = endDateString != null ? new Date(endDateString) : null;

  const days =
    startDateObj && endDateObj
      ? Math.max(
          1,
          Math.ceil(
            (endDateObj.getTime() - startDateObj.getTime()) / 86_400_000
          )
        )
      : null;

  // inside TouristIdGenerate.tsx

async function handleGenerate() {
  try {
    if (!trip) {
      Alert.alert("Trip not found", "Please plan your trip first.");
      return;
    }

    setLoading(true);

    const effectiveUserId = userId || userEmail;
    if (!effectiveUserId) {
      Alert.alert("User not found", "Please log in again.");
      return;
    }

    // 🔑 Try multiple keys for PID applicationId to be robust
    const candidateKeys = [
      `pid_application_id:${userEmail}`,
      userId ? `pid_application_id:${userId}` : null,
      "pid_application_id", // legacy/global key if it exists
    ].filter(Boolean) as string[];

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

    const startDate =
      trip.startNow && !trip.startDate
        ? new Date().toISOString().slice(0, 10)
        : trip.startDate || "";
    const endDate = trip.endDate || "";

    if (!startDate || !endDate) {
      Alert.alert(
        "Invalid dates",
        "Please ensure both start and end dates are set."
      );
      return;
    }

    const res: TripResponse = await createTrip({
      userId: effectiveUserId,
      holderPid: pidApplicationId,
      startDate,
      endDate,
      destination: trip.destination || null,
      itinerary: trip.itinerary || null,
      agencyId: trip.agencyId || null,
      homeCity: trip.homeCity || null,
      travelerType: "indian",
    });

    await AsyncStorage.setItem(`current_tid:${userEmail}`, res.tid);
    await AsyncStorage.setItem(`current_tid_status:${userEmail}`, res.status);

    updateTourist({
      tid: res.tid,
      tid_status: res.status,
      trip,
    });

    if (onProceed) {
      onProceed();
    }
  } catch (e: any) {
    Alert.alert(
      "Error",
      e?.message || "Failed to create Tourist ID. Please try again."
    );
  } finally {
    setLoading(false);
  }
}


  if (!trip) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tourist ID generation</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loaderText}>Loading trip draft…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tourist ID generation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>Trip summary</Text>
            <Badge>
              {(trip.mode || "direct").toUpperCase()}
            </Badge>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Start</Text>
              <Text style={styles.gridValue}>
                {trip.startNow ? "Right now" : trip.startDate || "—"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>End</Text>
              <Text style={styles.gridValue}>{trip.endDate || "—"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Destination</Text>
              <Text style={styles.gridValue}>
                {trip.destination || "Auto-assign (not hometown)"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Agency</Text>
              <Text style={styles.gridValue}>{trip.agencyId || "—"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Hometown</Text>
              <Text style={styles.gridValue}>{trip.homeCity || "—"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Duration</Text>
              <Text style={styles.gridValue}>
                {days ? `${days} day${days > 1 ? "s" : ""}` : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.itinerarySection}>
            <Text style={styles.gridLabel}>Itinerary / notes</Text>
            <View style={styles.itineraryBox}>
              <Text style={styles.itineraryText}>
                {trip.itinerary || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Button onPress={onBack}>
              <Text style={styles.buttonText}>Edit</Text>
            </Button>
            <View style={styles.buttonSpacer} />
            <Button onPress={handleGenerate} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? "Creating…" : "Generate ID"}
              </Text>
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111111",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222222",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  gridItem: {
    width: "50%",
    marginBottom: 8,
  },
  gridLabel: {
    color: "#A0A0A0",
    fontSize: 12,
    marginBottom: 2,
  },
  gridValue: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  itinerarySection: {
    marginTop: 12,
  },
  itineraryBox: {
    marginTop: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#1A1A1A",
  },
  itineraryText: {
    color: "#CCCCCC",
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonSpacer: {
    width: 12,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 8,
    color: "#CCCCCC",
  },
});
