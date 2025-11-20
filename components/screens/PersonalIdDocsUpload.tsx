import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Label from "../ui/Label";
import { Feather } from "@expo/vector-icons";
import { uploadAadhaarDoc, verifyAadhaarServer, finalizePersonalId } from "../../lib/pidDocs";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  applicationId: string;
  userId: string;
  onBack: () => void;
  onDone: () => void; // proceed to next step/summary
}

export default function PersonalIdDocsUpload({ applicationId, userId, onBack, onDone }: Props) {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      let picked: any = null;
      if ('assets' in result && result.assets && result.assets[0]) {
        picked = result.assets[0];
      } else if ('type' in result && result.type === "success") {
        picked = result;
      }

      if (picked) {
        let { name, uri, mimeType } = picked;
        let type = mimeType;
        if (!type) {
          if (name?.endsWith(".jpg") || name?.endsWith(".jpeg")) type = "image/jpeg";
          else if (name?.endsWith(".png")) type = "image/png";
          else if (name?.endsWith(".pdf")) type = "application/pdf";
          else type = "application/octet-stream";
        }
        setFile({ name, uri, type });
      } else {
        setFile(null);
      }
    } catch (e) {
      setError("Failed to pick file");
      setFile(null);
    }
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await uploadAadhaarDoc(applicationId, {
        uri: file.uri,
        name: file.name,
        type: file.type
      });
      const verify = await verifyAadhaarServer(applicationId);
      if (!verify.documentVerified) {
        alert('Checksum failed; sent to manual review.');
        return;
      }
      const final = await finalizePersonalId(applicationId);
      console.log('Finalize payload:', final);
      // --- User-specific key storage
      await AsyncStorage.setItem(`pid_personal_id:${userId}`, final.personalId);
      await AsyncStorage.setItem(`pid_full_name:${userId}`, final.name || '');
      await AsyncStorage.setItem(`pid_mobile:${userId}`, final.mobile || '');
      await AsyncStorage.setItem(`pid_email:${userId}`, final.email || '');
      await AsyncStorage.setItem(`pid_dob:${userId}`, final.dob || '');  

      alert(`Digital Personal ID created: ${final.personalId}`);
      onDone();
    } catch (e: any) {
      setError(e?.message || 'Upload/verification/finalize failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={onBack}>
          <Feather name="arrow-left" size={22} />
        </Button>
        <Text style={styles.headerTitle}>Upload Government ID (Front)</Text>
      </View>
      <View style={{ padding: 18 }}>
        <Card style={{ padding: 18, marginBottom: 12 }}>
          <Label>Accepted formats: PDF, JPG, PNG (max 5MB)</Label>
          <View style={styles.uploadBox}>
            <Feather name="upload" size={34} color="#6b7280" style={{ marginBottom: 8 }} />
            <Text style={{ color: "#6b7280", marginBottom: 8 }}>Pick a file to upload</Text>
            <Button variant="outline" onPress={pickFile}>
              Choose File
            </Button>
            {file && (
              <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}>
                <Feather name="check-circle" size={20} color="#22c55e" />
                <Text style={{ fontSize: 13, marginLeft: 4 }}>{file.name}</Text>
              </View>
            )}
          </View>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <Button onPress={submit} disabled={!file || loading} style={{ marginTop: 10 }}>
            {loading ? <ActivityIndicator color="#FFF" /> : 'Upload & Continue'}
          </Button>
        </Card>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 12 },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8
  },
  errorText: { color: "#dc2626", fontSize: 13 }
});
