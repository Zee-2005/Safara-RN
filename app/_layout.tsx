// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { UserDataProvider } from "../context/UserDataContext"; // adjust path

export default function RootLayout() {
  return (
    <UserDataProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserDataProvider>
  );
}
