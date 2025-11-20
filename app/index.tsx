import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LanguageSelector from "../components/screens/LanguageSelector";
import AuthScreen from "../components/screens/AuthScreen";
import HomeScreen from "../components/screens/HomeScreen";
import PersonalIdCreation from "../components/screens/PersonalIdCreation";
import PersonalIdDocsUpload from "../components/screens/PersonalIdDocsUpload";
import PersonalIdDetails from "../components/screens/PersonalIdDetails";
import PersonalIdDetailsModal from "../components/screens/PersonalIdDetailsModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PersonalSafety from "../components/screens/Personalsafety";
import { fetchAndSyncPersonalIdByEmail } from "../services/personalId"; // Adjust path as needed
import PlanTripHub from "../components/screens/PlanTripHub"; // <--- Add the import
import AgencyBrowse from "../components/screens/AgencyBrowse"; // <--- Add the import
import DirectIdQuick from "@/components/screens/DirectIdQuick";
import TripSummary from "@/components/screens/TripSummary";
import { readTripDraft } from "@/lib/trip";


export default function Index() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [confirmedLanguage, setConfirmedLanguage] = useState<string | null>(null);
  // These always represent email!
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  const [personalId, setPersonalId] = useState<string | null>(null);
  const [pidStep, setPidStep] = useState<null | "create" | "docs" | "details">(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showPersonalIdModal, setShowPersonalIdModal] = useState(false);
  const [personalIdInfo, setPersonalIdInfo] = useState<{
    pid: string | null;
    name: string | null;
    email: string | null;
    mobile: string | null;
    dob: string | null;
  }>({
    pid: null, name: null, email: null, mobile: null, dob: null
  });

  const [safetyActive, setSafetyActive] = useState(false);
  const [planTripActive, setPlanTripActive] = useState(false);
  const [agencyBrowseActive, setAgencyBrowseActive] = useState(false);
// For demo, add this too:
  const [touristIdGenerateActive, setTouristIdGenerateActive] = useState(false);
  const [directIdActive, setDirectIdActive] = useState(false);
  const [tripSummaryActive, setTripSummaryActive] = useState(false);
  const [tripSummary, setTripSummary] = useState<any>(null);

  // Always fetch PID from backend after (re)login
  useEffect(() => {
    if (userEmail) {
      fetchAndSyncPersonalIdByEmail(userEmail).then(pidData => {
        if (pidData) setPersonalId(pidData.personalId);
        else setPersonalId(null);
      });
    }
  }, [userEmail]);

  // Always load PID from AsyncStorage when login changes (backup for manual local writes)
  useEffect(() => {
    if (!loggedInUser) setPersonalId(null);
    else {
      AsyncStorage.getItem(`pid_personal_id:${loggedInUser}`).then(pid => setPersonalId(pid));
    }
  }, [loggedInUser, pidStep]);

  // Called on login from Auth screen
  function handleLogin(phoneOrEmail: string) {
    setUserEmail(phoneOrEmail);
    setLoggedInUser(phoneOrEmail);
    // fetchAndSyncPersonalIdByEmail(phoneOrEmail) will run by useEffect
  }

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
    return <AuthScreen onLogin={handleLogin} onGuestMode={() => setGuestMode(true)} />;
  }

  // 1st: Personal ID creation
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
        userId={loggedInUser}
        onBack={() => setPidStep("create")}
        onDone={async () => {
          // Refresh PID after docs creation/finalization
          const pid = await AsyncStorage.getItem(`pid_personal_id:${loggedInUser}`);
          setPersonalId(pid);
          setPidStep("details");
        }}
      />
    );
  }

  // 3rd: PID details (not usually visible; PID now auto-shown in Modal)
  if (pidStep === "details") {
    return (
      <PersonalIdDetails
        onBack={() => setPidStep(null)}
        onShowQr={() => { /* QR logic if needed */ }}
      />
    );
  }

  // 4th: Personal Safety Feature
  if (safetyActive) {
    return (
      <PersonalSafety
        isGuest={guestMode}
        onBack={() => setSafetyActive(false)}
      />
    );
  }

  if (agencyBrowseActive && userEmail) {
  return (
    <AgencyBrowse
      userEmail={userEmail}
      onBack={() => setAgencyBrowseActive(false)}
      onProceed={() => {
        setAgencyBrowseActive(false);
        setTouristIdGenerateActive(true); // <-- Next screen in trip plan process
      }}
    />
  );
}

  if (directIdActive && userEmail) {
  return (
    <DirectIdQuick
      userEmail={userEmail}
      onBack={() => setDirectIdActive(false)}
      onProceed={async () => {
        const summary = await readTripDraft(userEmail);
        setTripSummary(summary);
        setDirectIdActive(false);
        setTripSummaryActive(true);
      }}
    />
  );
}

if (tripSummaryActive && tripSummary) {
  return (
    <TripSummary
  visible={tripSummaryActive}
  summary={tripSummary}
  onClose={() => { setTripSummaryActive(false); setDirectIdActive(true); }}
  onProceed={() => { /* TODO: Implement submission or navigation */ }}
/>

  );
}

 

  if (planTripActive) {
    return (
      <PlanTripHub
        onBack={() => setPlanTripActive(false)}
        onNavigate={section => {
          if (section === "agencies") {
            // Navigate to agencies (add screen and state when ready)
            setAgencyBrowseActive(true);
          } else if (section === "direct") {
            setDirectIdActive(true);
          } else if (section === "ai") {
            // Do nothing or show "coming soon"
          }
        }}
      />
    );
  }




  // Handler to load personalId details for modal
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

  // HomeScreen default + Modal
  return (
    <>
      <HomeScreen
        userPhone={loggedInUser || undefined}
        isGuest={guestMode}
        personalId={personalId}
        onNavigate={section => {
          if (section === "personal-id" && personalId) {
            handleShowPersonalIdDetails();
          } else if (section === "personal-id") {
            setPidStep("create");
          } else if (section === "personal-safety") {
            setSafetyActive(true);
          }else if (section === "plan-journey") { 
            setPlanTripActive(true);
          }
          // ...other navigation as needed
        }}
        onLogout={() => {
          setLoggedInUser(null);
          setGuestMode(false);
          setUserEmail(null);
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
