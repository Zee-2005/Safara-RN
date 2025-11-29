// components/screens/TouristIdDocs.tsx
// Separate Skip / Submit for Indian; enforced Submit for International

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

import {
  uploadTripDocs,
  getTrip,
  TravelerType,
  UploadTripDocsFiles,
  TripResponse,
} from "../../lib/tourist.service";

type TabValue = "indian" | "international";

type PickedFile = {
  uri: string;
  name: string;
  type: string;
  size?: number | null;
};

type Props = {
  userEmail: string;
  userId?: string;
  onBack?: () => void;
  onSubmitted?: (isActive: boolean) => void;
};

export default function TouristIdDocs({
  userEmail,
  userId,
  onBack,
  onSubmitted,
}: Props) {
  const [tab, setTab] = useState<TabValue>("indian");

  const [indTicket, setIndTicket] = useState<PickedFile | null>(null);
  const [indHotel, setIndHotel] = useState<PickedFile | null>(null);
  const [indPermits, setIndPermits] = useState<PickedFile | null>(null);

  const [intlPassport, setIntlPassport] = useState<PickedFile | null>(null);
  const [intlVisa, setIntlVisa] = useState<PickedFile | null>(null);
  const [intlTicket, setIntlTicket] = useState<PickedFile | null>(null);
  const [intlHotel, setIntlHotel] = useState<PickedFile | null>(null);

  const [submitting, setSubmitting] = useState(false);

  function labelForFile(f: PickedFile | null) {
    if (!f) return "No file chosen";
    const kb =
      f.size != null && f.size > 0 ? `${(f.size / 1024).toFixed(1)} KB` : "";
    return kb ? `${f.name} (${kb})` : f.name;
  }

  async function pickFile(
    setter: (file: PickedFile | null) => void
  ): Promise<void> {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (res.canceled) {
        return;
      }

      const asset = res.assets[0];
      setter({
        uri: asset.uri,
        name: asset.name ?? "document",
        type: asset.mimeType ?? "application/octet-stream",
        size: asset.size,
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to pick document");
    }
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      const tid =
        (await AsyncStorage.getItem(`current_tid:${userEmail}`)) || "";
      if (!tid) {
        Alert.alert(
          "Trip not found",
          "Trip not found. Please generate Tourist ID again."
        );
        return;
      }

      const travelerType: TravelerType = tab;

      const files: UploadTripDocsFiles =
        travelerType === "indian"
          ? {
              ticket: indTicket
                ? {
                    uri: indTicket.uri,
                    name: indTicket.name,
                    type: indTicket.type,
                  }
                : undefined,
              hotel: indHotel
                ? {
                    uri: indHotel.uri,
                    name: indHotel.name,
                    type: indHotel.type,
                  }
                : undefined,
              permits: indPermits
                ? {
                    uri: indPermits.uri,
                    name: indPermits.name,
                    type: indPermits.type,
                  }
                : undefined,
            }
          : {
              passport: intlPassport
                ? {
                    uri: intlPassport.uri,
                    name: intlPassport.name,
                    type: intlPassport.type,
                  }
                : undefined,
              visa: intlVisa
                ? {
                    uri: intlVisa.uri,
                    name: intlVisa.name,
                    type: intlVisa.type,
                  }
                : undefined,
              ticket: intlTicket
                ? {
                    uri: intlTicket.uri,
                    name: intlTicket.name,
                    type: intlTicket.type,
                  }
                : undefined,
              hotel: intlHotel
                ? {
                    uri: intlHotel.uri,
                    name: intlHotel.name,
                    type: intlHotel.type,
                  }
                : undefined,
            };

      if (travelerType === "international" && !files.passport) {
        Alert.alert(
          "Passport required",
          "Passport is required for international trips."
        );
        return;
      }

      await uploadTripDocs(tid, travelerType, files);

      const latest: TripResponse = await getTrip(tid);

      if (onSubmitted) {
        onSubmitted(latest.status === "active");
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message || "Failed to upload documents. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkipIndian() {
    try {
      setSubmitting(true);

      const tid =
        (await AsyncStorage.getItem(`current_tid:${userEmail}`)) || "";
      if (!tid) {
        Alert.alert(
          "Trip not found",
          "Trip not found. Please generate Tourist ID again."
        );
        return;
      }

      const latest: TripResponse = await getTrip(tid);

      if (onSubmitted) {
        onSubmitted(latest.status === "active");
      }
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message || "Failed to continue. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const hasIndianDoc = !!(indTicket || indHotel || indPermits);
  const hasIntlPassport = !!intlPassport;

  function renderIndianTab() {
    return (
      <View style={styles.tabContent}>
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderIcon}>✈️</Text>
            <Text style={styles.cardHeaderTitle}>Travel ticket</Text>
            <Badge style={styles.badgeRight}>
              <Text style={styles.badgeText}>Optional</Text>
            </Badge>
          </View>
          <View style={styles.fileRow}>
            <Text style={styles.fileLabel}>{labelForFile(indTicket)}</Text>
            <Button onPress={() => pickFile(setIndTicket)}>
              <Text style={styles.buttonText}>Choose</Text>
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderIcon}>🏨</Text>
            <Text style={styles.cardHeaderTitle}>Hotel booking</Text>
            <Badge style={styles.badgeRight}>
              <Text style={styles.badgeText}>Optional</Text>
            </Badge>
          </View>
          <View style={styles.fileRow}>
            <Text style={styles.fileLabel}>{labelForFile(indHotel)}</Text>
            <Button onPress={() => pickFile(setIndHotel)}>
              <Text style={styles.buttonText}>Choose</Text>
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderIcon}>📄</Text>
            <Text style={styles.cardHeaderTitle}>Special permits</Text>
            <Badge style={styles.badgeRight}>
              <Text style={styles.badgeText}>Optional</Text>
            </Badge>
          </View>
          <View style={styles.fileRow}>
            <Text style={styles.fileLabel}>{labelForFile(indPermits)}</Text>
            <Button onPress={() => pickFile(setIndPermits)}>
              <Text style={styles.buttonText}>Choose</Text>
            </Button>
          </View>
        </Card>

        <View style={styles.submitRowIndian}>
          <Button
            variant="outline"
            onPress={handleSkipIndian}
            disabled={submitting}
          >
            <Text style={styles.outlineButtonText}>Skip for now</Text>
          </Button>
          <View style={{ width: 12 }} />
          <Button
            onPress={handleSubmit}
            disabled={submitting || !hasIndianDoc}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Submitting…" : "Submit documents"}
            </Text>
          </Button>
        </View>
      </View>
    );
  }

  function renderInternationalTab() {
    return (
      <View style={styles.tabContent}>
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderIcon}>🪪</Text>
            <Text style={styles.cardHeaderTitle}>Passport</Text>
            <Badge style={styles.badgeRightSecondary}>
              <Text style={styles.badgeText}>Required</Text>
            </Badge>
          </View>
          <View style={styles.fileRow}>
            <Text style={styles.fileLabel}>{labelForFile(intlPassport)}</Text>
            <Button onPress={() => pickFile(setIntlPassport)}>
              <Text style={styles.buttonText}>Choose</Text>
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderIcon}>📄</Text>
            <Text style={styles.cardHeaderTitle}>Visa</Text>
            <Badge style={styles.badgeRight}>
              <Text style={styles.badgeText}>Optional</Text>
            </Badge>
          </View>
          <View style={styles.fileRow}>
            <Text style={styles.fileLabel}>{labelForFile(intlVisa)}</Text>
            <Button onPress={() => pickFile(setIntlVisa)}>
              <Text style={styles.buttonText}>Choose</Text>
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderIcon}>✈️</Text>
            <Text style={styles.cardHeaderTitle}>Travel ticket</Text>
            <Badge style={styles.badgeRight}>
              <Text style={styles.badgeText}>Optional</Text>
            </Badge>
          </View>
          <View style={styles.fileRow}>
            <Text style={styles.fileLabel}>{labelForFile(intlTicket)}</Text>
            <Button onPress={() => pickFile(setIntlTicket)}>
              <Text style={styles.buttonText}>Choose</Text>
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderIcon}>🏨</Text>
            <Text style={styles.cardHeaderTitle}>Hotel booking</Text>
            <Badge style={styles.badgeRight}>
              <Text style={styles.badgeText}>Optional</Text>
            </Badge>
          </View>
          <View style={styles.fileRow}>
            <Text style={styles.fileLabel}>{labelForFile(intlHotel)}</Text>
            <Button onPress={() => pickFile(setIntlHotel)}>
              <Text style={styles.buttonText}>Choose</Text>
            </Button>
          </View>
        </Card>

        <View style={styles.submitRowSingle}>
          <Button
            onPress={handleSubmit}
            disabled={submitting || !hasIntlPassport}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Submitting…" : "Submit & generate"}
            </Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Upload documents</Text>
          <Text style={styles.headerSubtitle}>
            Provide relevant documents to finalize a time‑bound Tourist ID.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              tab === "indian" && styles.tabButtonActive,
            ]}
            onPress={() => setTab("indian")}
          >
            <Text
              style={[
                styles.tabButtonText,
                tab === "indian" && styles.tabButtonTextActive,
              ]}
            >
              Indian
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              tab === "international" && styles.tabButtonActive,
            ]}
            onPress={() => setTab("international")}
          >
            <Text
              style={[
                styles.tabButtonText,
                tab === "international" && styles.tabButtonTextActive,
              ]}
            >
              International
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "indian" ? renderIndianTab() : renderInternationalTab()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111111",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222222",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginRight: 8,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 2,
    color: "#A0A0A0",
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333333",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#111111",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#2563EB",
  },
  tabButtonText: {
    color: "#A0A0A0",
    fontSize: 14,
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: "#FFFFFF",
  },
  tabContent: {
    marginTop: 8,
  },
  card: {
    padding: 12,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardHeaderIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  cardHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  badgeRight: {
    marginLeft: "auto",
    backgroundColor: "#1F2933",
  },
  badgeRightSecondary: {
    marginLeft: "auto",
    backgroundColor: "#4B5563",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  fileLabel: {
    flex: 1,
    marginRight: 8,
    color: "#A0A0A0",
    fontSize: 12,
  },
  submitRowIndian: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  submitRowSingle: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  outlineButtonText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "500",
  },
});
