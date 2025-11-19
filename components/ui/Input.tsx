import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor="#A1A1AA"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 4,
    backgroundColor: "#F8FAFC",
    color: "#111827",
  },
});
