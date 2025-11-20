import { Feather } from "@expo/vector-icons"; // Use Feather for all icons
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { saveTripDraft } from "../../lib/trip";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Select } from "../ui/Select"; // use previously supplied native Select
import { SafeAreaView } from "react-native-safe-area-context";

const DESTINATIONS = ['Delhi', 'Mumbai', 'Leh', 'Kathmandu', 'Jaipur', 'Goa', 'Varanasi'];
const REGIONS = ['Southern India', 'Himalayan Mountains', 'Kashmir', 'Western Ghats', 'Golden Triangle'];
const GUIDES = ['Arun Mehta', 'Sana Iqbal', 'Tashi Dorje', 'Rhea Sen', 'Govt. Tourist Helpdesk'];
const STYLES = ['Festival & Events', 'Food & Culinary', 'Hiking & Trekking', 'River Cruise', 'Culture & Heritage'];

const AGENCIES = [
  {
    id: 'safe-gt-01',
    name: 'SafeTrail Expeditions',
    rating: 4.8,
    durationDays: 6,
    places: ['Delhi', 'Agra', 'Jaipur'],
    destination: 'Golden Triangle',
    startDate: '2025-10-05',
    endDate: '2025-10-10',
    price: '₹24,999',
    style: 'Culture & Heritage',
    region: 'Golden Triangle',
  },
  {
    id: 'coast-goa-02',
    name: 'CoastalCare Trips',
    rating: 4.6,
    durationDays: 4,
    places: ['Panaji', 'Old Goa', 'Palolem'],
    destination: 'Goa',
    startDate: '2025-11-12',
    endDate: '2025-11-15',
    price: '₹14,950',
    style: 'Food & Culinary',
    region: 'Western Ghats',
  },
  {
    id: 'hike-leh-03',
    name: 'HimalayaSecure',
    rating: 4.7,
    durationDays: 7,
    places: ['Leh', 'Nubra', 'Pangong'],
    destination: 'Leh',
    startDate: '2025-09-29',
    endDate: '2025-10-05',
    price: '₹32,500',
    style: 'Hiking & Trekking',
    region: 'Himalayan Mountains',
  },
  {
    id: 'kashmir-fest-04',
    name: 'ValleyGuard Tours',
    rating: 4.5,
    durationDays: 5,
    places: ['Srinagar', 'Gulmarg', 'Pahalgam'],
    destination: 'Kashmir',
    startDate: '2025-12-03',
    endDate: '2025-12-07',
    price: '₹26,400',
    style: 'Festival & Events',
    region: 'Kashmir',
  },
];

interface AgencyBrowseProps {
  userEmail: string;
  onBack: () => void;
  onProceed: () => void;
}

export default function AgencyBrowse({ userEmail, onBack, onProceed }: AgencyBrowseProps) {
  const [destination, setDestination] = useState("");
  const [region, setRegion] = useState("");
  const [guide, setGuide] = useState("");
  const [style, setStyle] = useState("");

  const filtered = useMemo(() => {
    return AGENCIES.filter(a =>
      (!destination || a.destination.toLowerCase().includes(destination.toLowerCase()) || a.places.some(p => p.toLowerCase().includes(destination.toLowerCase())))
      && (!region || a.region === region)
      && (!style || a.style === style)
      // Guide demo: not in use since no guide on agencies, but you could add filtering here
    );
  }, [destination, region, style]);

  const handleProceed = async (a: typeof AGENCIES[0]) => {
    await saveTripDraft(userEmail, {
      mode: 'agencies',
      startNow: false,
      startDate: a.startDate,
      endDate: a.endDate,
      destination: a.destination,
      itinerary: a.places.join(' • '),
      agencyId: a.id,
    });
    onProceed();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Button variant="ghost" onPress={onBack}>
            <Feather name="arrow-left" size={23} />
          </Button>

          <View style={{ flexShrink: 1 }}>
            <Text style={styles.headerText}>Browse agencies</Text>
            <Text style={styles.headerDesc} numberOfLines={1}>
              Filter by destination, region, guide, and travel style.
            </Text>
          </View>
        </View>

        {/* FILTERS */}
        <View style={styles.filterContainer}>
          <View style={styles.filterCol}>
            <Text style={styles.inputLabel}>Destination</Text>
            <Select
              value={destination}
              onValueChange={setDestination}
              items={[{ label: "Any", value: "" }, ...DESTINATIONS.map(x => ({ label: x, value: x }))]}
            />
          </View>

          <View style={styles.filterCol}>
            <Text style={styles.inputLabel}>Region</Text>
            <Select
              value={region}
              onValueChange={setRegion}
              items={[{ label: "Any", value: "" }, ...REGIONS.map(x => ({ label: x, value: x }))]}
            />
          </View>

          <View style={styles.filterCol}>
            <Text style={styles.inputLabel}>Guide</Text>
            <Select
              value={guide}
              onValueChange={setGuide}
              items={[{ label: "Any", value: "" }, ...GUIDES.map(x => ({ label: x, value: x }))]}
            />
          </View>

          <View style={styles.filterCol}>
            <Text style={styles.inputLabel}>Style</Text>
            <Select
              value={style}
              onValueChange={setStyle}
              items={[{ label: "Any", value: "" }, ...STYLES.map(x => ({ label: x, value: x }))]}
            />
          </View>
        </View>

        {/* RESULTS */}
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {filtered.length === 0 && (
            <Card style={styles.noResultsCard}>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>
                No agencies match the selected filters.
              </Text>
            </Card>
          )}

          {filtered.map(a => (
            <Card key={a.id} style={styles.agencyCard}>
              {/* TOP ROW */}
              <View style={styles.rowTop}>
                <View style={styles.leftSection}>
                  <View style={styles.iconCircle}>
                    <Feather name="briefcase" size={18} color="#2563eb" />
                  </View>

                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.agencyName} numberOfLines={1}>
                      {a.name}
                    </Text>

                    <View style={styles.badgeRow}>
                      <Badge variant="outline">{a.region}</Badge>
                      <Badge variant="secondary">{a.style}</Badge>
                    </View>

                    <View style={styles.metaRow}>
                      <Feather name="star" size={13} color="#fbbf24" />
                      <Text style={styles.metaText}>{a.rating.toFixed(1)}</Text>

                      <Text style={styles.dot}>•</Text>

                      <Feather name="calendar" size={13} color="#6b7280" />
                      <Text style={styles.metaText}>{a.durationDays} days</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.priceBox}>
                  <Text style={styles.priceText}>{a.price}</Text>
                  <Text style={styles.perPerson}>per person</Text>
                </View>
              </View>

              {/* DETAILS GRID */}
              <View style={styles.detailsRow}>
                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Destination</Text>
                  <Text numberOfLines={1}>{a.destination}</Text>
                </View>

                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Dates</Text>
                  <Text numberOfLines={1}>{a.startDate} → {a.endDate}</Text>
                </View>

                <View style={styles.detailCell}>
                  <Text style={styles.detailLabel}>Visits</Text>
                  <Text numberOfLines={1}>{a.places.join(" • ")}</Text>
                </View>
              </View>

              {/* BUTTON */}
              <Button style={styles.proceedBtn} onPress={onProceed}>
                Proceed <Feather name="chevron-right" size={16} />
              </Button>
            </Card>
          ))}
        </ScrollView>
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
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 19,
  },
  headerDesc: {
    fontSize: 12.5,
    color: "#6b7280",
  },

  /* FILTERS */
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    rowGap: 14,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterCol: {
    width: "48%",
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 4,
  },

  /* RESULTS */
  resultsContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  noResultsCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 16,
  },

  /* AGENCY CARD */
  agencyCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#fff",
  },

  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  leftSection: {
    flexDirection: "row",
    gap: 12,
    flexShrink: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },

  agencyName: {
    fontWeight: "700",
    fontSize: 15.5,
    marginBottom: 3,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  dot: {
    marginHorizontal: 3,
    color: "#9ca3af",
  },

  priceBox: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 70,
  },
  priceText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  perPerson: {
    fontSize: 12,
    color: "#6b7280",
  },

  /* DETAILS GRID */
  detailsRow: {
    flexDirection: "row",
    marginTop: 14,
    columnGap: 12,
  },
  detailCell: {
    flex: 1,
  },
  detailLabel: {
    color: "#6b7280",
    fontSize: 11,
    marginBottom: 2,
  },

  /* BUTTON */
  proceedBtn: {
    marginTop: 16,
    alignSelf: "flex-end",
  },
});