import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type Variant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps {
  variant?: Variant;
  className?: string; // Optional for further styling if using nativewind etc.
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
}

const variantStyles: { [key in Variant]: { container: ViewStyle; text: TextStyle } } = {
  default: {
    container: {
      backgroundColor: "#3B82F6", // bg-primary (blue-500)
      borderColor: "transparent",
      shadowColor: "#60A5FA",
      shadowOpacity: 0.3,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    text: {
      color: "white", // text-primary-foreground
      fontWeight: "600",
      fontSize: 12,
      textAlign: "center",
      letterSpacing: 0.5,
    },
  },
  secondary: {
    container: {
      backgroundColor: "#f3f4f6", // bg-secondary (gray-100)
      borderColor: "transparent",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    text: {
      color: "#6B7280", // text-secondary-foreground (gray-500)
      fontWeight: "600",
      fontSize: 12,
      textAlign: "center",
      letterSpacing: 0.5,
    },
  },
  destructive: {
    container: {
      backgroundColor: "#EF4444", // bg-destructive (red-500)
      borderColor: "transparent",
      shadowColor: "#F87171",
      shadowOpacity: 0.3,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    text: {
      color: "white", // text-destructive-foreground
      fontWeight: "600",
      fontSize: 12,
      textAlign: "center",
      letterSpacing: 0.5,
    },
  },
  outline: {
    container: {
      backgroundColor: "transparent",
      borderColor: "#D1D5DB", // border color gray-300 used for outline
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: "flex-start",
    },
    text: {
      color: "#374151", // slightly darker gray text
      fontWeight: "600",
      fontSize: 12,
      textAlign: "center",
      letterSpacing: 0.5,
    },
  },
};

export default function Badge({ variant = "default", style, textStyle, children }: BadgeProps) {
  const currentStyle = variantStyles[variant];
  return (
    <View style={[currentStyle.container, style]}>
      <Text style={[currentStyle.text, textStyle]}>{children}</Text>
    </View>
  );
}
