import React from "react";
import { View, StyleSheet, Animated } from "react-native";

interface ProgressProps {
  value?: number;
  style?: object;
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, style = {} }) => {
  // Clamp the value between 0 and 100
  const width = Math.max(0, Math.min(value, 100));
  return (
    <View style={[styles.root, style]}>
      <Animated.View style={[styles.bar, { width: `${width}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  bar: {
    height: "100%",
    backgroundColor: "#246BFD",
    borderRadius: 8,
  },
});
