import React, { useState } from "react";
import { View } from "react-native";
import LanguageSelector from "../components/screens/LanguageSelector";
import AuthScreen from "../components/screens/AuthScreen";

export default function Index() {
  // State for selected language (updated on language select)
 const [selectedLanguage, setSelectedLanguage] = useState("en");

  // State for confirmed language after pressing Continue
  const [confirmedLanguage, setConfirmedLanguage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  // Called whenever user picks a language in LanguageSelector
  const onLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  // Called when user clicks "Continue" in LanguageSelector
  const onContinue = () => {
    if (selectedLanguage) {
      setConfirmedLanguage(selectedLanguage);
    } else {
      alert("Please select a language before continuing.");
    }
  };

  // Called after successful login
  const onLogin = (user: string) => {
    setLoggedInUser(user);
    console.log("Logged in as", user);
  };

  // Called if guest mode clicked
  const onGuestMode = () => {
    setGuestMode(true);
    console.log("Guest mode active");
  };

  // Rendering logic:
  // 1. Show LanguageSelector until user presses Continue
  if (!confirmedLanguage) {
    return (
      <LanguageSelector
  selectedLanguage={selectedLanguage}
  onLanguageSelect={onLanguageSelect}
  onContinue={onContinue}
/>

    );
  }

  // 2. Show AuthScreen if logged out and not in guest mode
  if (!loggedInUser && !guestMode) {
    return <AuthScreen onLogin={onLogin} onGuestMode={onGuestMode} />;
  }

  // 3. Show placeholders or real app screen after login or guest mode
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>Language Selected: {confirmedLanguage}</View>
      {loggedInUser && <View>Logged In as: {loggedInUser}</View>}
      {guestMode && <View>Guest Mode: Browse only</View>}
    </View>
  );
}
