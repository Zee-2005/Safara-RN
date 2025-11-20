import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

function formatDob(dobString: string | number | Date): string {
  if (dobString === undefined || dobString === null || dobString === "") return "";
  // e.g. 2000-12-11 -> 11 Dec 2000
  const d = new Date(dobString);
  if (isNaN(+d)) return String(dobString);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}


export default function PersonalIdDetailsModal({ visible, onClose, pid, name, email, mobile,dob }: {
  visible: boolean,
  onClose: () => void,
  pid: string | null,
  name: string | null,
  email: string | null,
  mobile: string | null,
  dob: string | null,
})

{
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
            <Feather name="user" size={22} />
            <Text style={{ fontWeight: "bold", fontSize: 17, marginLeft: 7 }}>Your Digital Personal ID</Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: "auto" }}>
              <Feather name="x" size={21} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Personal ID</Text>
              <Text style={styles.pidValue} selectable numberOfLines={2} ellipsizeMode="middle">
                {pid}
              </Text>
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{name || "—"}</Text>
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Mobile</Text>
              <Text style={styles.value}>{mobile || "—"}</Text>
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{email || "—"}</Text>
            </View>
            <View style={styles.fieldWrap}>
  <Text style={styles.label}>Date of Birth</Text>
  <Text style={styles.value}>{dob ? formatDob(dob) : "—"}</Text>
</View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "stretch",
    backgroundColor: "rgba(0,0,0,0.45)"
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 32,
    minHeight: 280,
    maxHeight: 400,
    marginHorizontal: 0,
    ...Platform.select({ android: { elevation: 8 } })
  },
  fieldWrap: { marginTop: 10, alignItems: "center", marginBottom: 8 },
  label: { fontSize: 13, color: "#6b7280", marginBottom: 3, fontWeight: "500" },
  pidValue: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14, paddingHorizontal: 8,
    textAlign: "center", color: "#222", backgroundColor: "#eef1f4", borderRadius: 5
  },
  value: { fontSize: 15, fontWeight: "500", color: "#222", textAlign: "center" },
});
