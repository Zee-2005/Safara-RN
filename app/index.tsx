import React, { useState } from "react";
import LanguageSelector from "../components/screens/LanguageSelector";
import AuthScreen from "../components/screens/AuthScreen";
import HomeScreen from "../components/screens/HomeScreen";
import PersonalIdCreation from "../components/screens/PersonalIdCreation";
import PersonalIdDocsUpload from "../components/screens/PersonalIdDocsUpload";
import PersonalIdDetails from "../components/screens/PersonalIdDetails";

export default function Index() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [confirmedLanguage, setConfirmedLanguage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  // Personal ID flow states
  const [pidStep, setPidStep] = useState<null | "create" | "docs" | "details">(null);
  const [creationData, setCreationData] = useState<any>(null);

  // For final docs stage
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // For demo, QR mode: show popover/modal or just a flag
  const [showQr, setShowQr] = useState(false);

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

  if (!loggedInUser && !guestMode) {
    return <AuthScreen onLogin={setLoggedInUser} onGuestMode={() => setGuestMode(true)} />;
  }

  // 1st stage: Personal ID creation
  if (pidStep === "create") {
    return (
      <PersonalIdCreation
        onComplete={data => {
          setCreationData(data);
          setApplicationId(data.applicationId);
          setPidStep("docs");
        }}
        onBack={() => setPidStep(null)}
      />
    );
  }

  // 2nd stage: Docs upload
  if (pidStep === "docs" && applicationId) {
    return (
      <PersonalIdDocsUpload
        applicationId={applicationId}
        onBack={() => setPidStep("create")}
        onDone={() => setPidStep("details")}
      />
    );
  }

  // 3rd stage: Show personal ID details
  if (pidStep === "details") {
    return (
      <PersonalIdDetails
        onBack={() => setPidStep(null)}
        onShowQr={() => setShowQr(true)}
      />
      // For showQr: launch a Modal with your QR code, then setShowQr(false) to dismiss
    );
  }

  // HomeScreen default
  return (
    <HomeScreen
      userPhone={loggedInUser || undefined}
      isGuest={guestMode}
      onNavigate={section => {
        if (section === "personal-id") setPidStep("create");
        // ... add more as you route other tiles
      }}
      onLogout={() => {
        setLoggedInUser(null);
        setGuestMode(false);
        setConfirmedLanguage(null);
      }}
    />
  );
}
