import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";

interface NativeSelectProps<T extends string | number> {
  value?: T;
  onValueChange: (value: T, index: number) => void;
  items: { label: string; value: T }[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
}

export function Select<T extends string | number = string>({
  value,
  onValueChange,
  items,
  label,
  placeholder,
  disabled,
  style
}: NativeSelectProps<T>) {
  const [showModal, setShowModal] = React.useState(false);

  // Find the selected label, or show placeholder
  const selectedLabel = items.find((item) => item.value === value)?.label || placeholder || "Select…";

  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[
          styles.trigger,
          disabled && { opacity: 0.6 }
        ]}
        disabled={disabled}
        onPress={() => setShowModal(true)}
      >
        <Text style={[styles.triggerText, !value && { color: "#9ca3af" }]}>
          {selectedLabel}
        </Text>
        <Feather name="chevron-down" size={18} color="#a1a1aa" />
      </TouchableOpacity>
      {showModal && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
          <TouchableOpacity style={styles.modalBg} onPress={() => setShowModal(false)} activeOpacity={1}>
            <View style={styles.modalCard}>
              <Picker
                selectedValue={value}
                onValueChange={(v, idx) => {
                  setShowModal(false);
                  onValueChange(v as T, idx);
                }}
                enabled={!disabled}
                mode="dropdown"
                style={{ width: "100%" }}
              >
                {placeholder ? (
                  <Picker.Item label={placeholder} value={undefined} />
                ) : null}
                {items.map((item) => (
                  <Picker.Item
                    label={item.label}
                    value={item.value}
                    key={String(item.value)}
                    color={item.value === value ? "#246BFD" : "#222"}
                  />
                ))}
              </Picker>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: "#222", marginBottom: 6 },
  trigger: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: "#d1d5db",
    backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10
  },
  triggerText: {
    fontSize: 15, flex: 1,
    color: "#111827"
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  modalCard: {
    marginHorizontal: 16, borderRadius: 14, backgroundColor: "#fff", padding: 6,
    // iOS/Android shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 5 },
    }),
  },
});
