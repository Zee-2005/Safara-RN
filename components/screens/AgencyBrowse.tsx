// components/screens/AgencyBrowse.tsx
// Trip summary + Tourist ID generation inline (no separate summary screen)

import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Label from "../ui/Label";

import { saveTripDraft } from "../../lib/trip";
import { createTrip } from "../../lib/tourist.service";

type Agency = {
  id: string;
  name: string;
  rating: number;
  durationDays: number;
  places: string[];
  destination: string;
  startDate: string;
  endDate: string;
  price: string;
  style: string;
  region: string;
};

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

const DESTINATIONS = [
  "Delhi",
  "Mumbai",
  "Leh",
  "Kathmandu",
  "Jaipur",
  "Goa",
  "Varanasi",
];
const REGIONS = [
  "Southern India",
  "Himalayan Mountains",
  "Kashmir",
  "Western Ghats",
  "Golden Triangle",
];
const GUIDES = [
  "Arun Mehta",
  "Sana Iqbal",
  "Tashi Dorje",
  "Rhea Sen",
  "Govt. Tourist Helpdesk",
];
const STYLES = [
  "Festival & Events",
  "Food & Culinary",
  "Hiking & Trekking",
  "River Cruise",
  "Culture & Heritage",
];

const AGENCIES: Agency[] = [
  {
    id: "safe-gt-01",
    name: "SafeTrail Expeditions",
    rating: 4.8,
    durationDays: 6,
    places: ["Delhi", "Agra", "Jaipur"],
    destination: "Golden Triangle",
    startDate: "2025-10-05",
    endDate: "2025-10-10",
    price: "₹24,999",
    style: "Culture & Heritage",
    region: "Golden Triangle",
  },
  {
    id: "coast-goa-02",
    name: "CoastalCare Trips",
    rating: 4.6,
    durationDays: 4,
    places: ["Panaji", "Old Goa", "Palolem"],
    destination: "Goa",
    startDate: "2025-11-12",
    endDate: "2025-11-15",
    price: "₹14,950",
    style: "Food & Culinary",
    region: "Western Ghats",
  },
  {
    id: "hike-leh-03",
    name: "HimalayaSecure",
    rating: 4.7,
    durationDays: 7,
    places: ["Leh", "Nubra", "Pangong"],
    destination: "Leh",
    startDate: "2025-09-29",
    endDate: "2025-10-05",
    price: "₹32,500",
    style: "Hiking & Trekking",
    region: "Himalayan Mountains",
  },
  {
    id: "kashmir-fest-04",
    name: "ValleyGuard Tours",
    rating: 4.5,
    durationDays: 5,
    places: ["Srinagar", "Gulmarg", "Pahalgam"],
    destination: "Kashmir",
    startDate: "2025-12-03",
    endDate: "2025-12-07",
    price: "₹26,400",
    style: "Festival & Events",
    region: "Kashmir",
  },
];

interface Props {
  userEmail?: string;
  onBack: () => void;
  onProceed: () => void; // will be called AFTER trip is created – go directly to docs screen
}

export default function AgencyBrowse({ userEmail, onBack, onProceed }: Props) {
  const [destination, setDestination] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [guide, setGuide] = useState<string>("");
  const [style, setStyle] = useState<string>("");

  const [summaryVisible, setSummaryVisible] = useState(false);
  const [summary, setSummary] = useState<TripSummaryData | null>(null);
  const [pendingAgency, setPendingAgency] = useState<Agency | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return AGENCIES.filter((a) => {
      const destOk =
        !destination ||
        a.destination.toLowerCase().includes(destination.toLowerCase()) ||
        a.places.some((p) =>
          p.toLowerCase().includes(destination.toLowerCase())
        );
      const regionOk = !region || a.region === region;
      const styleOk = !style || a.style === style;
      return destOk && regionOk && styleOk;
    });
  }, [destination, region, style]);

  function openSummary(a: Agency) {
    setPendingAgency(a);
    setSummary({
      mode: "agencies",
      startNow: false,
      startDate: a.startDate,
      endDate: a.endDate,
      destination: a.destination,
      itinerary: a.places.join(" • "),
      agencyId: a.id,
      homeCity: null,
    });
    setSummaryVisible(true);
  }

  async function confirmSummary() {
    if (!pendingAgency || !summary) return;

    try {
      setCreating(true);

      const userKey = userEmail;
      if (!userKey) {
        Alert.alert("Login required", "Please log in again to continue.");
        return;
      }

      // Get PID applicationId (holderPid) from AsyncStorage
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

      const a = pendingAgency;
      const draft = {
        mode: "agencies",
        startNow: false,
        startDate: a.startDate,
        endDate: a.endDate,
        destination: a.destination,
        itinerary: a.places.join(" • "),
        agencyId: a.id,
      } as any;

      // Save draft (optional but keeps local state consistent)
      await saveTripDraft(userKey, draft);

      // Create trip on backend (Tourist ID)
      const res = await createTrip({
        userId: userKey,
        holderPid: pidApplicationId,
        startDate: a.startDate,
        endDate: a.endDate,
        destination: a.destination,
        itinerary: a.places.join(" • "),
        agencyId: a.id,
        homeCity: null,
        travelerType: "indian",
      });

      await AsyncStorage.setItem(`current_tid:${userKey}`, res.tid);
      await AsyncStorage.setItem(
        `current_tid_status:${userKey}`,
        res.status
      );

      setSummaryVisible(false);
      setPendingAgency(null);
      onProceed(); // parent should now go directly to TouristIdDocs
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message || "Failed to create Tourist ID. Please try again."
      );
    } finally {
      setCreating(false);
    }
  }

  function closeSummary() {
    setSummaryVisible(false);
    setPendingAgency(null);
  }

  function FilterPill({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
  }) {
    return (
      
      <View style={{ marginBottom: 12 }}>
        <Label>{label}</Label>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 6 }}
        >
          <TouchableOpacity
            onPress={() => onChange("")}
            style={[
              styles.filterChip,
              value === "" && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                value === "" && styles.filterChipTextActive,
              ]}
            >
              Any
            </Text>
          </TouchableOpacity>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={[
                styles.filterChip,
                value === opt && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  value === opt && styles.filterChipTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Browse agencies</Text>
            <Text style={styles.headerSubtitle}>
              Filter by destination, region, guide, and travel style.
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersWrap}>
          <FilterPill
            label="Destinations"
            value={destination}
            options={DESTINATIONS}
            onChange={setDestination}
          />
          <FilterPill
            label="Regions"
            value={region}
            options={REGIONS}
            onChange={setRegion}
          />
          <FilterPill
            label="Travel guides"
            value={guide}
            options={GUIDES}
            onChange={setGuide}
          />
          <FilterPill
            label="Travel styles"
            value={style}
            options={STYLES}
            onChange={setStyle}
          />
        </View>

        {/* Results */}
        <View style={styles.resultsWrap}>
          {filtered.map((a) => (
            <Card key={a.id} style={styles.agencyCard}>
              <View style={styles.agencyHeader}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "rgba(59,130,246,0.1)" },
                    ]}
                  >
                    <Text style={[styles.iconText, { color: "#3b82f6" }]}>
                      B
                    </Text>
                  </View>
                  <View>
                    <View style={styles.row}>
                      <Text style={styles.agencyName}>{a.name}</Text>
                      <Badge variant="outline">{a.region}</Badge>
                      <Badge variant="secondary">{a.style}</Badge>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>
                        ★ {a.rating.toFixed(1)}
                      </Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>
                        {a.durationDays} days
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.priceText}>{a.price}</Text>
                  <Text style={styles.priceSub}>per person</Text>
                </View>
              </View>

              <View style={styles.agencyDetails}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Destination</Text>
                  <Text style={styles.detailValue}>{a.destination}</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Dates</Text>
                  <Text style={styles.detailValue}>
                    {a.startDate} → {a.endDate}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Visits</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {a.places.join(" • ")}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Button onPress={() => openSummary(a)}>
                  <Text style={styles.buttonText}>Proceed →</Text>
                </Button>
              </View>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No agencies match the current filters.
              </Text>
            </Card>
          )}
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

                <View style={styles.rowModal}>
                  <View style={styles.colModal}>
                    <Text style={styles.label}>Destination</Text>
                    <Text style={styles.value}>{destinationLabel}</Text>
                  </View>
                  <View style={styles.colModal}>
                    <Text style={styles.label}>Agency</Text>
                    <Text style={styles.value}>
                      {summary.agencyId || "—"}
                    </Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>
                    Planned visits / itinerary
                  </Text>
                  <View style={styles.itineraryBox}>
                    <Text style={styles.itineraryText}>
                      {summary.itinerary || "—"}
                    </Text>
                  </View>
                </View>
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  backText: { fontSize: 16 },
  headerTextWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  filtersWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  filterChipActive: {
    backgroundColor: "#256eb",
    borderColor: "#256eb",
  },
  filterChipText: { fontSize: 12, color: "#4b5563" },
  filterChipTextActive: { color: "#ffffff" },
  resultsWrap: { padding: 16, rowGap: 12 },
  agencyCard: { padding: 16, borderRadius: 12, backgroundColor: "#ffffff" },
  agencyHeader: { flexDirection: "row", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", columnGap: 6 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  iconText: { fontWeight: "700" },
  agencyName: { fontWeight: "600", fontSize: 15, marginRight: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaText: { fontSize: 11, color: "#6b7280" },
  metaDot: { marginHorizontal: 4, fontSize: 11, color: "#6b7280" },
  priceText: { fontSize: 13, fontWeight: "600" },
  priceSub: { fontSize: 11, color: "#6b7280" },
  agencyDetails: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 10,
  },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11, color: "#6b7280" },
  detailValue: { fontSize: 13, color: "#111827", marginTop: 2 },
  cardFooter: { marginTop: 14, alignItems: "flex-end" },
  buttonText: { color: "#ffffff", fontWeight: "600" },
  emptyCard: { padding: 16, borderRadius: 12, backgroundColor: "#ffffff" },
  emptyText: { fontSize: 13, color: "#6b7280" },

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
