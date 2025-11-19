import React, { useState } from "react";
import { View, Text } from "react-native";
import LanguageSelector from "../components/screens/LanguageSelector";
import AuthScreen from "../components/screens/AuthScreen";
import HomeScreen from "../components/screens/HomeScreen";

export default function Index() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [confirmedLanguage, setConfirmedLanguage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  const onLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const onContinue = () => {
    if (selectedLanguage) {
      setConfirmedLanguage(selectedLanguage);
    } else {
      alert("Please select a language before continuing.");
    }
  };

  const onLogin = (user: string) => {
    setLoggedInUser(user);
    console.log("Logged in as", user);
  };

  const onGuestMode = () => {
    setGuestMode(true);
    console.log("Guest mode active");
  };

  // SHOW LanguageSelector if language not confirmed yet
  if (!confirmedLanguage) {
    return (
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageSelect={onLanguageSelect}
        onContinue={onContinue}
      />
    );
  }

  // SHOW AuthScreen if user not logged in and not guest
  if (!loggedInUser && !guestMode) {
    return <AuthScreen onLogin={onLogin} onGuestMode={onGuestMode} />;
  }

  // SHOW HomeScreen after login or guest
  return (
    <HomeScreen
      userPhone={loggedInUser || undefined}
      isGuest={guestMode}
      onNavigate={(section) => console.log("Navigate to", section)}
      onLogout={() => {
        setLoggedInUser(null);
        setGuestMode(false);
        setConfirmedLanguage(null); // optionally reset to language selector on logout
      }}
    />
  );
}
