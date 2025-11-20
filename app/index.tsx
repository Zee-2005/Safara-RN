import React, { useState, useEffect } from "react";
import LanguageSelector from "../components/screens/LanguageSelector";
import AuthScreen from "../components/screens/AuthScreen";
import HomeScreen from "../components/screens/HomeScreen";
import PersonalIdCreation from "../components/screens/PersonalIdCreation";
import PersonalIdDocsUpload from "../components/screens/PersonalIdDocsUpload";
import PersonalIdDetails from "../components/screens/PersonalIdDetails";
import PersonalIdDetailsModal from "../components/screens/PersonalIdDetailsModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PersonalSafety from "../components/screens/Personalsafety";

export default function Index() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [confirmedLanguage, setConfirmedLanguage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  // Holds user's PID for this session
  const [personalId, setPersonalId] = useState<string | null>(null);
  // Personal ID flow states
  const [pidStep, setPidStep] = useState<null | "create" | "docs" | "details">(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showPersonalIdModal, setShowPersonalIdModal] = useState(false);
  const [personalIdInfo, setPersonalIdInfo] = useState<{pid: string | null; name: string | null; email: string | null; mobile: string | null; dob: string | null}>({
  pid: null, name: null, email: null, mobile: null, dob: null
});

  const [safetyActive, setSafetyActive] = useState(false);


  useEffect(() => {
    if (!loggedInUser) setPersonalId(null);
    else {
      AsyncStorage.getItem(`pid_personal_id:${loggedInUser}`).then(pid => setPersonalId(pid));
    }
  }, [loggedInUser, pidStep]); // reload on login/PID flow step change

  if (!confirmedLanguage) {
    return (
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageSelect={setSelectedLanguage}
        onContinue={() => setConfirmedLanguage(selectedLanguage)}
      />
    );
  }

  if (!loggedInUser && !guestMode) {
    return <AuthScreen onLogin={setLoggedInUser} onGuestMode={() => setGuestMode(true)} />;
  }

  // 1st stage: PID creation
  if (pidStep === "create") {
    return (
      <PersonalIdCreation
        onComplete={data => {
          setApplicationId(data.applicationId);
          setPidStep("docs");
        }}
        onBack={() => setPidStep(null)}
      />
    );
  }

  // 2nd: Docs upload
  if (pidStep === "docs" && applicationId && loggedInUser) {
    return (
      <PersonalIdDocsUpload
        applicationId={applicationId}
        userId={loggedInUser}  // Pass user ID here!
        onBack={() => setPidStep("create")}
        onDone={async () => {
          // After docs, refresh PID for this user:
          const pid = await AsyncStorage.getItem(`pid_personal_id:${loggedInUser}`);
          setPersonalId(pid);
          setPidStep("details");
        }}
      />
    );
  }

  // 3rd: PID details
  if (pidStep === "details") {
    return (
      <PersonalIdDetails onBack={() => setPidStep(null)} onShowQr={() => { /* show QR logic */ }} />
    );
  }
  if (safetyActive) {
    return (
      <PersonalSafety
        isGuest={guestMode}
        onBack={() => setSafetyActive(false)}
      />
    );
  }

  const handleShowPersonalIdDetails = async () => {
    if (!loggedInUser) return;
    const pid = await AsyncStorage.getItem(`pid_personal_id:${loggedInUser}`);
    const name = await AsyncStorage.getItem(`pid_full_name:${loggedInUser}`);
    const email = await AsyncStorage.getItem(`pid_email:${loggedInUser}`);
    const mobile = await AsyncStorage.getItem(`pid_mobile:${loggedInUser}`);
    const dob = await AsyncStorage.getItem(`pid_dob:${loggedInUser}`);
  setPersonalIdInfo({ pid, name, email, mobile, dob });
    setShowPersonalIdModal(true);
  };

  // HomeScreen default
  return (
   
    <>
      <HomeScreen
        userPhone={loggedInUser || undefined}
        isGuest={guestMode}
        personalId={personalId}
        onNavigate={section => {
          if (section === "personal-id" && personalId) {
            handleShowPersonalIdDetails(); // Show modal
          } else if (section === "personal-id") {
            setPidStep("create"); // Creation
          } else if (section === "personal-safety") {
          setSafetyActive(true);
        }
          // ...others
        }}
        onLogout={() => {
          setLoggedInUser(null);
          setGuestMode(false);
          setConfirmedLanguage(null);
          setPersonalId(null);
        }}
      />
      {/* PID Details Modal */}
      <PersonalIdDetailsModal
        visible={showPersonalIdModal}
        onClose={() => setShowPersonalIdModal(false)}
        pid={personalIdInfo.pid}
        name={personalIdInfo.name}
        email={personalIdInfo.email}
        mobile={personalIdInfo.mobile}
        dob={personalIdInfo.dob}
      />
    </>
  );
}
