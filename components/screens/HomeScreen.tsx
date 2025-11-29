// components/screens/HomeScreen.tsx  [memory:13]

import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { getMyTrips } from "../../lib/tourist.service";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";

interface HomeScreenProps {
  userPhone?: string;
  userEmail?: string;
  isGuest?: boolean;
  personalId?: string | null;
  onNavigate: (section: string) => void;
  onLogout?: () => void;
}

type TripItem = {
  tid: string;
  status: "active" | "scheduled" | "expired";
  startDate: string;
  endDate: string;
  destination: string | null;
  travelerType: "indian" | "international";
  createdAt: string;
};

export default function HomeScreen({
  userPhone,
  userEmail,
  isGuest = false,
  personalId,
  onNavigate,
  onLogout,
}: HomeScreenProps) {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [showTrips, setShowTrips] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    if (isGuest || !userEmail) return;
    (async () => {
      try {
        const data = await getMyTrips(userEmail);
        const list = data?.trips || [];
        setTrips(list);

        const seenKey = `trips_seen_count:${userEmail}`;
        const seenRaw = await AsyncStorage.getItem(seenKey);
        const seen = seenRaw ? parseInt(seenRaw, 10) : 0;
        const total = list.length;
        const diff = total - seen;
        setNewCount(diff > 0 ? diff : 0);
      } catch {
        // ignore
      }
    })();
  }, [isGuest, userEmail, personalId, showTrips]);

  const active = trips.filter((t) => t.status === "active");
  const upcoming = trips.filter((t) => t.status === "scheduled");
  const expired = trips.filter((t) => t.status === "expired");
  const bellCount = active.length + upcoming.length;

  function handleSectionClick(id: string, status: string) {
    if (status === "disabled") return;
    onNavigate(id);
  }

  async function handleOpenTrips() {
    setShowTrips(true);
    if (userEmail) {
      await AsyncStorage.setItem(
        `trips_seen_count:${userEmail}`,
        String(trips.length)
      );
      setNewCount(0);
    }
  }

  function daysBetween(a: string, b: string): number {
    const d1 = new Date(a);
    const d2 = new Date(b);
    const ms = d2.getTime() - d1.getTime();
    return Math.ceil(ms / 86_400_000);
  }

  const todayISO = new Date().toISOString().slice(0, 10);

  const sectionIcons: any = {
    "personal-id": <Feather name="shield" size={24} color="#fff" />,
    "plan-journey": <Feather name="map-pin" size={24} color="#fff" />,
    "personal-safety": <Feather name="heart" size={24} color="#fff" />,
    feedback: <Feather name="message-square" size={24} color="#fff" />,
    leaderboard: <FontAwesome name="trophy" size={24} color="#fff" />,
  };

  const hasPid = !!personalId;
  const sections = [
    {
      id: "personal-id",
      title: hasPid ? "View Personal ID" : "Create Personal ID",
      description: hasPid
        ? "Show and share your secure digital personal ID"
        : "Verify your identity for secure travel",
      icon: "personal-id",
      status: isGuest ? "disabled" : "available",
      color: "#246BFD",
      badge: hasPid ? null : isGuest ? null : "Required",
    },
    {
      id: "plan-journey",
      title: "Plan Journey",
      description: "Discover safe travel routes and destinations",
      icon: "plan-journey",
      status: "available",
      color: "#22c55e",
      badge: null,
    },
    {
      id: "personal-safety",
      title: "Personal Safety",
      description: "Emergency contacts and safety preferences",
      icon: "personal-safety",
      status: isGuest ? "limited" : "available",
      color: "#ef4444",
      badge: null,
    },
    {
      id: "feedback",
      title: "Feedback",
      description: "Share your travel experiences",
      icon: "feedback",
      status: "available",
      color: "#facc15",
      badge: null,
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      description: "View safety achievements and rewards",
      icon: "leaderboard",
      status: isGuest ? "view-only" : "available",
      color: "#3b82f6",
      badge: null,
    },
  ];

  const visibleSections = sections;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>SaFara</Text>
          <Text style={styles.subtitle}>
            {isGuest ? "Guest Mode" : `Welcome, ${userPhone}`}
          </Text>
        </View>
        <View style={styles.iconRow}>
          {!isGuest && (
            <TouchableOpacity
              onPress={handleOpenTrips}
              style={styles.headerBtn}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color="#2563eb"
              />
              {bellCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{bellCount}</Text>
                </View>
              )}
              {newCount > 0 && (
                <View style={styles.newDot} />
              )}
            </TouchableOpacity>
          )}
          {!isGuest && (
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#2563eb"
              />
            </TouchableOpacity>
          )}
          {!isGuest && (
            <TouchableOpacity onPress={onLogout} style={styles.headerBtn}>
              <Feather name="log-out" size={24} color="#2563eb" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="settings" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {isGuest && (
        <View style={styles.guestBanner}>
          <Text style={styles.guestText}>
            Sign in to access Personal ID and full safety tools.
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View>
          <Text style={styles.sectionTitle}>Travel Safety Hub</Text>
          {visibleSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionCard,
                { backgroundColor: "#fff" },
                section.status === "disabled" && styles.disabledCard,
              ]}
              onPress={() => handleSectionClick(section.id, section.status)}
              disabled={section.status === "disabled"}
            >
              <View style={styles.sectionInnerRow}>
                <View
                  style={[styles.iconBox, { backgroundColor: section.color }]}
                >
                  {sectionIcons[section.icon]}
                </View>
                <View style={styles.sectionTextContainer}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitleText}>
                      {section.title}
                    </Text>
                    {section.badge && (
                      <Badge variant="secondary">{section.badge}</Badge>
                    )}
                    {section.status === "disabled" && (
                      <Badge variant="destructive">Login Required</Badge>
                    )}
                    {section.status === "limited" && (
                      <Badge variant="outline">Limited Access</Badge>
                    )}
                    {section.status === "view-only" && (
                      <Badge variant="outline">View Only</Badge>
                    )}
                  </View>
                  <Text style={styles.sectionDescription}>
                    {section.description}
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Trips modal */}
      <Modal
        visible={showTrips}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTrips(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your trips</Text>
            <ScrollView style={{ maxHeight: 300, alignSelf: "stretch" }}>
              {active.map((t) => {
                const daysLeft = Math.max(
                  0,
                  daysBetween(todayISO, t.endDate)
                );
                return (
                  <View key={t.tid} style={styles.tripItem}>
                    <View style={styles.tripItemHeader}>
                      <Text style={styles.tripItemTitle}>
                        Active • {t.destination || "Unknown"}
                      </Text>
                      <Badge variant="secondary">Active</Badge>
                    </View>
                    <Text style={styles.tripItemDetails}>
                      {t.startDate} → {t.endDate} • ends in {daysLeft}{" "}
                      day{daysLeft === 1 ? "" : "s"}
                    </Text>
                    <Text style={styles.tripId}>{t.tid}</Text>
                  </View>
                );
              })}

              {upcoming.map((t) => {
                const daysUntil = Math.max(
                  0,
                  daysBetween(todayISO, t.startDate)
                );
                return (
                  <View key={t.tid} style={styles.tripItem}>
                    <View style={styles.tripItemHeader}>
                      <Text style={styles.tripItemTitle}>
                        Upcoming • {t.destination || "Unknown"}
                      </Text>
                      <Badge variant="outline">Scheduled</Badge>
                    </View>
                    <Text style={styles.tripItemDetails}>
                      {t.startDate} → {t.endDate} • starts in {daysUntil}{" "}
                      day{daysUntil === 1 ? "" : "s"}
                    </Text>
                    <Text style={styles.tripId}>{t.tid}</Text>
                  </View>
                );
              })}

              {expired.map((t) => (
                <View key={t.tid} style={styles.tripItem}>
                  <View style={styles.tripItemHeader}>
                    <Text style={styles.tripItemTitle}>
                      Expired • {t.destination || "Unknown"}
                    </Text>
                    <Badge variant="destructive">Expired</Badge>
                  </View>
                  <Text style={styles.tripItemDetails}>
                    {t.startDate} → {t.endDate}
                  </Text>
                  <Text style={styles.tripId}>{t.tid}</Text>
                </View>
              ))}

              {trips.length === 0 && (
                <Text style={styles.noTripText}>
                  No trips yet. Plan a journey to see notifications here.
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowTrips(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280" },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: { marginHorizontal: 4, position: "relative" },
  bellBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bellBadgeText: { color: "white", fontSize: 10 },
  newDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  guestBanner: {
    padding: 12,
    backgroundColor: "rgba(36, 107, 253, 0.1)",
  },
  guestText: { color: "#2563eb", fontSize: 14 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, marginTop: 24 },
  sectionCard: { padding: 16, marginBottom: 12, borderRadius: 12, elevation: 2 },
  disabledCard: { opacity: 0.5 },
  sectionInnerRow: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTextContainer: { flex: 1 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitleText: { fontSize: 16, fontWeight: "600", marginRight: 5 },
  sectionDescription: { color: "#6b7280", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 340,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  tripItem: { padding: 12, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  tripItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripItemTitle: { fontSize: 16, fontWeight: "600" },
  tripItemDetails: { fontSize: 14, color: "#6b7280" },
  tripId: { fontSize: 12, marginTop: 4, color: "#9ca3af" },
  noTripText: { textAlign: "center", color: "#6b7280", marginVertical: 16 },
  closeButton: {
    marginTop: 12,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },
  closeButtonText: { color: "#ffffff", fontWeight: "600" },
});
