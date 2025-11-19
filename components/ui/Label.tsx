import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

export default function Label({ children, style, ...rest }: { children: React.ReactNode } & TextProps) {
  return (
    <Text style={[styles.lbl, style]} {...rest}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  lbl: {
    fontWeight: "500",
    fontSize: 15,
    color: "#374151",
    marginBottom: 2,
  },
});
