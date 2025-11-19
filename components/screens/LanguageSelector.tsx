import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
];

interface LanguageSelectorProps {
  selectedLanguage: string; // NEW: comes from parent
  onLanguageSelect: (language: string) => void;
  onContinue: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage = "en", // default English if missing
  onLanguageSelect,
  onContinue,
}) => {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="earth" size={32} color="#ffffff" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>SaFara</Text>
            <Text style={styles.subtitle}>Choose your preferred language</Text>
            <Text style={styles.hint}>[translate: अपनी भाषा चुनें]</Text>
          </View>
        </View>

        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.gridWrap}>
            <View style={styles.grid}>
              {languages.map((language) => {
                const selected = selectedLanguage === language.code;

                return (
                  <Pressable
                    key={language.code}
                    style={[
                      styles.langBtn,
                      selected ? styles.langBtnSelected : styles.langBtnOutline,
                    ]}
                    onPress={() => onLanguageSelect(language.code)}
                    testID={`button-language-${language.code}`}
                  >
                    <Text
                      style={[
                        styles.langName,
                        selected ? styles.langTextSelected : styles.langText,
                      ]}
                    >
                      {language.name}
                    </Text>

                    <Text
                      style={[
                        styles.langNative,
                        selected
                          ? styles.langTextSelectedDim
                          : styles.langTextDim,
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <Pressable
          onPress={onContinue}
          testID="button-continue"
          style={styles.cta}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LanguageSelector;


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fbff",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    gap: 16,
  },
  headerWrap: {
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#246BFD",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  hint: {
    fontSize: 12,
    color: "#6B7280",
  },
  card: {
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    maxHeight: 320,
  },
  gridWrap: {
    paddingBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  langBtn: {
    width: "48%",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  langBtnOutline: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  langBtnSelected: {
    backgroundColor: "#246BFD",
    borderWidth: 1,
    borderColor: "#1E58D6",
  },
  langName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  langNative: {
    fontSize: 12,
    opacity: 0.75,
    textAlign: "center",
    marginTop: 2,
  },
  langText: { color: "#111827" },
  langTextDim: { color: "#111827" },
  langTextSelected: { color: "#ffffff" },
  langTextSelectedDim: { color: "#E6ECFF" },
  cta: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#246BFD",
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
