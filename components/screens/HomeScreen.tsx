import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  TouchableOpacity, 
} from "react-native";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { getSession, getUserItem } from "../../lib/session";
import { readTripDraft, clearTripDraft } from "../../lib/trip";
import { getMyTrips } from "../../lib/tourist.service";
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

interface HomeScreenProps {
  userPhone?: string;
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
};

// ...imports unchanged
export default function HomeScreen({
  userPhone,
  isGuest = false,
  personalId,
  onNavigate,
  onLogout,
}: HomeScreenProps) {
  // Remove unneeded PID-related state - only tile logic needed
  const [tripDraft, setTripDraft] = useState<any>(null);
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [showTrips, setShowTrips] = useState(false);

  useEffect(() => {
    const d = readTripDraft();
    if (d && (d.endDate || d.destination || d.itinerary || d.mode)) setTripDraft(d);
  }, []);

  useEffect(() => {
    if (isGuest) return;
    (async () => {
      try {
        const data = await getMyTrips();
        setTrips(data?.trips || []);
      } catch {}
    })();
  }, [isGuest]);

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
      badge: tripDraft ? "Draft" : null,
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

  const active = trips.filter((t) => t.status === "active");
  const upcoming = trips.filter((t) => t.status === "scheduled");
  const bellCount = active.length + upcoming.length;

  const handleSectionClick = (id: string, status: string) => {
    if (status === "disabled") return;
    onNavigate(id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>SaFara</Text>
          <Text style={styles.subtitle}>
            {isGuest ? "Guest Mode" : `Welcome, ${userPhone}`}
          </Text>
        </View>
        {/* ...rest of your header, trips, etc */}
        <View style={styles.iconRow}>
          {!isGuest && (
            <TouchableOpacity onPress={() => setShowTrips(true)} style={styles.headerBtn}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#2563eb" />
              {bellCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{bellCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {!isGuest && (
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="person-circle-outline" size={24} color="#2563eb" />
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
            [translate:Sign in to access Personal ID and full safety tools.]
          </Text>
        </View>
      )}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Only show the list of sections/tiles */}
        
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
                <View style={[styles.iconBox, { backgroundColor: section.color }]}>
                  {sectionIcons[section.icon]}
                </View>
                <View style={styles.sectionTextContainer}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitleText}>{section.title}</Text>
                    {section.badge && <Badge variant="secondary">{section.badge}</Badge>}
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
                  <Text style={styles.sectionDescription}>{section.description}</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* ...your tip section, dialog, etc */}
      </ScrollView>
      {/* ...your trips modal etc */}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb"
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280" },
  iconRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerBtn: { marginHorizontal: 4 },
  bellBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  bellBadgeText: { color: "white", fontSize: 10 },
  guestBanner: {
    padding: 12,
    backgroundColor: "rgba(36, 107, 253, 0.1)"
  },
  guestText: { color: "#2563eb", fontSize: 14 },
  content: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  badgeVerified: { flexDirection: "row", alignItems: "center" },
  verifiedText: { marginLeft: 3, color: "#22c55e", fontWeight: "600" },
  infoGrid: { marginTop: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  infoLabel: { fontSize: 14, color: "#6b7280" },
  infoValueRow: { flexDirection: "row", alignItems: "center" },
  infoValue: { fontSize: 14, color: "#111827", marginRight: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
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
    marginRight: 12
  },
  sectionTextContainer: { flex: 1 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitleText: { fontSize: 16, fontWeight: "600", marginRight: 5 },
  sectionDescription: { color: "#6b7280", marginTop: 4 },
  tipTitle: { fontWeight: "600", fontSize: 15, marginBottom: 5 },
  tipText: { fontSize: 13, color: "#6b7280" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalContent: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center"
  },
  tripItem: { padding: 12, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  tripItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tripItemTitle: { fontSize: 16, fontWeight: "600" },
  tripItemDetails: { fontSize: 14, color: "#6b7280" },
  tripId: { fontSize: 12, marginTop: 4, color: "#9ca3af" },
  noTripText: { textAlign: "center", color: "#6b7280", marginVertical: 16 }
});
