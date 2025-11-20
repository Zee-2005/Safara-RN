import React from "react";
import { Switch as RNSwitch, SwitchProps } from "react-native";

export function Switch(props: SwitchProps) {
  return (
    <RNSwitch
      trackColor={{ false: "#d1d5db", true: "#246BFD" }}
      thumbColor={props.value ? "#fff" : "#f3f4f6"}
      ios_backgroundColor="#d1d5db"
      {...props}
    />
  );
}
