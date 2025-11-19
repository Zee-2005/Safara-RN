import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

interface RNDialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
}: RNDialogProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={{ marginTop: 12 }}>{children}</View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#fff",
    width: 300,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  description: { fontSize: 14, color: "#666", marginTop: 4 },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#246BFD",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeText: { color: "#fff", fontWeight: "600" },
});
