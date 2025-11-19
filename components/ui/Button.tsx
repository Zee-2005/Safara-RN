import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from "react-native";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  disabled?: boolean;
  style?: ViewStyle;
  loading?: boolean;
}

export default function Button({
  onPress,
  children,
  variant = "default",
  disabled,
  style,
  loading,
}: ButtonProps) {
  let bg = "#246BFD", color = "#FFF", border = "#246BFD";
  if (variant === "outline") { bg = "#FFF"; color = "#246BFD"; border = "#246BFD"; }
  if (variant === "secondary") { bg = "#E5E7EB"; color = "#246BFD"; border = "#E5E7EB"; }
  if (variant === "ghost") { bg = "#FFF"; color = "#246BFD"; border = "#FFF"; }
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.6 : 1 },
        variant === "outline" && styles.outline,
        style,
      ]}
      accessibilityRole="button"
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.btnText, { color }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
    borderWidth: 1,
  },
  outline: { backgroundColor: "#FFF" },
  btnText: { fontSize: 16, fontWeight: "600" },
});
