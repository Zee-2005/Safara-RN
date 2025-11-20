import React from "react";
import { TextInput, StyleSheet, StyleProp, TextStyle } from "react-native";

interface TextareaProps {
  style?: StyleProp<TextStyle>;
  [key: string]: any;
}

export function Textarea({ style, ...props }: TextareaProps) {
  return (
    <TextInput
      style={[styles.textarea, style]}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    minHeight: 80,
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    marginVertical: 6,
  },
});
