// app/(root)/index.tsx  [memory:13]

import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LanguageSelector from "../components/screens/LanguageSelector";
import AuthScreen from "../components/screens/AuthScreen";
import HomeScreen from "../components/screens/HomeScreen";
import PersonalIdCreation from "../components/screens/PersonalIdCreation";
import PersonalIdDocsUpload from "../components/screens/PersonalIdDocsUpload";
import PersonalIdDetails from "../components/screens/PersonalIdDetails";
import PersonalIdDetailsModal from "../components/screens/PersonalIdDetailsModal";
import PersonalSafety from "../components/screens/Personalsafety";
import PlanTripHub from "../components/screens/PlanTripHub";
import AgencyBrowse from "../components/screens/AgencyBrowse";
import DirectIdQuick from "../components/screens/DirectIdQuick";
import TouristIdDocs from "../components/screens/TouristIdDocs";

import { fetchAndSyncPersonalIdByEmail } from "../services/personalId";

export default function Index() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [confirmedLanguage, setConfirmedLanguage] = useState<string | null>(
    null
  );
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  const [personalId, setPersonalId] = useState<string | null>(null);
  const [pidStep, setPidStep] = useState<null | "create" | "docs" | "details">(
    null
  );
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showPersonalIdModal, setShowPersonalIdModal] = useState(false);
  const [personalIdInfo, setPersonalIdInfo] = useState<{
    pid: string | null;
    name: string | null;
    email: string | null;
    mobile: string | null;
    dob: string | null;
  }>({
    pid: null,
    name: null,
    email: null,
    mobile: null,
    dob: null,
  });

  const [safetyActive, setSafetyActive] = useState(false);
  const [planTripActive, setPlanTripActive] = useState(false);
  const [agencyBrowseActive, setAgencyBrowseActive] = useState(false);
  const [touristIdDocsActive, setTouristIdDocsActive] = useState(false);
  const [directIdActive, setDirectIdActive] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchAndSyncPersonalIdByEmail(userEmail).then((pidData) => {
        if (pidData) setPersonalId(pidData.personalId);
        else setPersonalId(null);
      });
    }
  }, [userEmail]);

  useEffect(() => {
    if (!loggedInUser) {
      setPersonalId(null);
    } else {
      AsyncStorage.getItem(`pid_personal_id:${loggedInUser}`).then((pid) =>
        setPersonalId(pid)
      );
    }
  }, [loggedInUser, pidStep]);

  function handleLogin(phoneOrEmail: string) {
    setUserEmail(phoneOrEmail);
    setLoggedInUser(phoneOrEmail);
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
    return (
      <AuthScreen
        onLogin={handleLogin}
        onGuestMode={() => setGuestMode(true)}
      />
    );
  }

  if (pidStep === "create") {
    return (
      <PersonalIdCreation
        onComplete={(data) => {
          setApplicationId(data.applicationId);
          setPidStep("docs");
        }}
        onBack={() => setPidStep(null)}
      />
    );
  }

  if (pidStep === "docs" && applicationId && loggedInUser) {
    return (
      <PersonalIdDocsUpload
        applicationId={applicationId}
        userId={loggedInUser}
        onBack={() => setPidStep("create")}
        onDone={async () => {
          const pid = await AsyncStorage.getItem(
            `pid_personal_id:${loggedInUser}`
          );
          setPersonalId(pid);
          setPidStep("details");
        }}
      />
    );
  }

  if (pidStep === "details") {
    return (
      <PersonalIdDetails
        onBack={() => setPidStep(null)}
        onShowQr={() => {}}
      />
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

  // Agencies flow: PlanTripHub → AgencyBrowse → (modal) Generate ID → TouristIdDocs
  if (agencyBrowseActive && userEmail) {
    return (
      <AgencyBrowse
        userEmail={userEmail}
        onBack={() => setAgencyBrowseActive(false)}
        onProceed={() => {
          setAgencyBrowseActive(false);
          setTouristIdDocsActive(true);
        }}
      />
    );
  }

  // Direct flow: PlanTripHub → DirectIdQuick → (modal) Generate ID → TouristIdDocs
  if (directIdActive && userEmail) {
    return (
      <DirectIdQuick
        userEmail={userEmail}
        onBack={() => setDirectIdActive(false)}
        onProceed={() => {
          setDirectIdActive(false);
          setTouristIdDocsActive(true);
        }}
      />
    );
  }

  // After any ID is generated, upload docs then go back home
  if (touristIdDocsActive && userEmail) {
    return (
      <TouristIdDocs
        userEmail={userEmail}
        userId={loggedInUser || undefined}
        onBack={() => {
          setTouristIdDocsActive(false);
        }}
        onSubmitted={(isActive: boolean) => {
          setTouristIdDocsActive(false);
          setPlanTripActive(false);
          // Now HomeScreen will render next
        }}
      />
    );
  }

  if (planTripActive) {
    return (
      <PlanTripHub
        onBack={() => setPlanTripActive(false)}
        onNavigate={(section) => {
          if (section === "agencies") {
            setAgencyBrowseActive(true);
          } else if (section === "direct") {
            setDirectIdActive(true);
          } else if (section === "ai") {
            // Coming soon
          }
        }}
      />
    );
  }

  const handleShowPersonalIdDetails = async () => {
    if (!loggedInUser) return;
    const pid = await AsyncStorage.getItem(
      `pid_personal_id:${loggedInUser}`
    );
    const name = await AsyncStorage.getItem(
      `pid_full_name:${loggedInUser}`
    );
    const email = await AsyncStorage.getItem(
      `pid_email:${loggedInUser}`
    );
    const mobile = await AsyncStorage.getItem(
      `pid_mobile:${loggedInUser}`
    );
    const dob = await AsyncStorage.getItem(`pid_dob:${loggedInUser}`);
    setPersonalIdInfo({ pid, name, email, mobile, dob });
    setShowPersonalIdModal(true);
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <HomeScreen
          userPhone={loggedInUser || undefined}
          // userEmail={userEmail || undefined}
          isGuest={guestMode}
          personalId={personalId}
          onNavigate={(section) => {
            if (section === "personal-id" && personalId) {
              handleShowPersonalIdDetails();
            } else if (section === "personal-id") {
              setPidStep("create");
            } else if (section === "personal-safety") {
              setSafetyActive(true);
            } else if (section === "plan-journey") {
              setPlanTripActive(true);
            }
          }}
          onLogout={() => {
            setLoggedInUser(null);
            setGuestMode(false);
            setUserEmail(null);
            setConfirmedLanguage(null);
            setPersonalId(null);
          }}
        />
      </SafeAreaView>
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
