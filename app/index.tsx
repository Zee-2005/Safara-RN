import React, { useState } from "react";
import { View, Text } from "react-native";
import LanguageSelector from "../components/screens/LanguageSelector";
import AuthScreen from "../components/screens/AuthScreen";
import HomeScreen from "../components/screens/HomeScreen";
import PersonalIdCreation from "../components/screens/PersonalIdCreation";

export default function Index() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [confirmedLanguage, setConfirmedLanguage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  // NEW: controls Home/PersonalIdCreation flow after login
  const [showPersonalIdFlow, setShowPersonalIdFlow] = useState(false);
  const [creationData, setCreationData] = useState<any>(null);

  // Step 1: Language selection
  if (!confirmedLanguage) {
    return (
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageSelect={setSelectedLanguage}
        onContinue={() => {
          if (selectedLanguage) setConfirmedLanguage(selectedLanguage);
          else alert("Please select a language before continuing.");
        }}
      />
    );
  }

  // Step 2: Auth/login
  if (!loggedInUser && !guestMode) {
    return <AuthScreen onLogin={setLoggedInUser} onGuestMode={() => setGuestMode(true)} />;
  }

  // Step 3: Personal ID Creation flow (from HomeScreen "Create Personal ID" tab)
  if (showPersonalIdFlow) {
    return (
      <PersonalIdCreation
        onComplete={data => {
          setCreationData(data);
          setShowPersonalIdFlow(false);
        }}
        onBack={() => setShowPersonalIdFlow(false)}
      />
    );
  }

  // Step 4: HomeScreen default
  return (
    <HomeScreen
      userPhone={loggedInUser || undefined}
      isGuest={guestMode}
      // When user selects a tile/tab:
      onNavigate={section => {
        if (section === "personal-id") {
          setShowPersonalIdFlow(true);
        } else {
          // handle other sections/routes here
          console.log("Navigate to", section);
        }
      }}
      onLogout={() => {
        setLoggedInUser(null);
        setGuestMode(false);
        setConfirmedLanguage(null);
      }}
    />
  );
}
