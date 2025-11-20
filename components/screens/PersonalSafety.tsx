import React, { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert
} from 'react-native';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/Switch';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Feather } from '@expo/vector-icons';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface MedicalInfo {
  bloodType: string;
  allergies: string;
  medications: string;
  conditions: string;
  emergencyNotes: string;
}

interface SafetyCheckSettings {
  enabled: boolean;
  interval: number;
  reminderEnabled: boolean;
}

interface PersonalSafetyProps {
  isGuest?: boolean;
  onBack: () => void;
}

export default function PersonalSafety({ isGuest = false, onBack }: PersonalSafetyProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'medical' | 'checks'>('contacts');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Raul Handa',
      phone: '+91-9876543210',
      relationship: 'Father',
      isPrimary: true
    }
  ]);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    bloodType: '',
    allergies: '',
    medications: '',
    conditions: '',
    emergencyNotes: ''
  });
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheckSettings>({
    enabled: true,
    interval: 4,
    reminderEnabled: true
  });
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship,
      isPrimary: emergencyContacts.length === 0
    };
    setEmergencyContacts(prev => [...prev, contact]);
    setNewContact({ name: '', phone: '', relationship: '' });
  };

  const handleRemoveContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    setEmergencyContacts(prev =>
      prev.map(contact => ({
        ...contact,
        isPrimary: contact.id === id
      }))
    );
  };

  const handleMedicalUpdate = (field: keyof MedicalInfo, value: string) => {
    setMedicalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSafetyCheckToggle = (field: keyof SafetyCheckSettings, value: boolean | number) => {
    setSafetyChecks(prev => ({ ...prev, [field]: value }));
  };

  // TABS
  const tabOptions = [
    { key: 'contacts', icon: <Feather name="phone" size={18} />, label: 'Contacts' },
    { key: 'medical', icon: <Feather name="heart" size={18} />, label: 'Medical' },
    { key: 'checks', icon: <Feather name="clock" size={18} />, label: 'Checks' }
  ];

  const renderContactsTab = () => (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Emergency Contacts</Text>
        <Badge variant="secondary">{emergencyContacts.length} contacts</Badge>
      </View>
      <View>
        {emergencyContacts.map(contact => (
          <Card key={contact.id} style={{ marginBottom: 10, padding: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                <View style={styles.avatarCircle}>
                  <Feather name="user" size={20} color="#fff" />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontWeight: "bold" }}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <Badge style={styles.primaryBadge} textStyle={styles.primaryBadgeText}>Primary</Badge>
                    )}
                  </View>
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    {contact.phone} • {contact.relationship}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                {!contact.isPrimary && (
                  <Button variant="outline"  style={{ marginRight: 3 }} onPress={() => handleSetPrimary(contact.id)}>
                    Set Primary
                  </Button>
                )}
                <Button variant="outline"  onPress={() => handleRemoveContact(contact.id)}>
                  <Feather name="trash-2" size={17} />
                </Button>
              </View>
            </View>
          </Card>
        ))}
      </View>
      {/* Add new emergency contact */}
      {!isGuest && (
        <Card style={{ padding: 14 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 7 }}>Add Emergency Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={newContact.name}
            onChangeText={name => setNewContact(prev => ({ ...prev, name }))}
          />
          <TextInput
            style={styles.input}
            placeholder="+91-9876543210"
            value={newContact.phone}
            keyboardType="phone-pad"
            onChangeText={phone => setNewContact(prev => ({ ...prev, phone }))}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g., Father, Friend, Spouse"
            value={newContact.relationship}
            onChangeText={relationship => setNewContact(prev => ({ ...prev, relationship }))}
          />
          <Button
            style={{ marginTop: 12 }}
            onPress={handleAddContact}
            disabled={!newContact.name || !newContact.phone}
          >
            <Feather name="plus" size={17} style={{ marginRight: 4 }} /> Add Contact
          </Button>
        </Card>
      )}
    </View>
  );

  const renderMedicalTab = () => (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Medical Information</Text>
        <Badge variant="outline" textStyle={{ fontSize: 12 }}>Optional</Badge>
      </View>
      <Card style={{ padding: 14 }}>
        <Text style={styles.inputLabel}>Blood Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., O+, A-, AB+"
          value={medicalInfo.bloodType}
          onChangeText={v => handleMedicalUpdate('bloodType', v)}
          editable={!isGuest}
        />
        <Text style={styles.inputLabel}>Known Allergies</Text>
        <Textarea
          placeholder="List any allergies to food, medications, or other substances..."
          value={medicalInfo.allergies}
          onChangeText={(v: string) => handleMedicalUpdate('allergies', v)}
          editable={!isGuest}
        />
        <Text style={styles.inputLabel}>Current Medications</Text>
        <Textarea
          placeholder="List medications you're currently taking..."
          value={medicalInfo.medications}
          onChangeText={(v: string) => handleMedicalUpdate('medications', v)}
          editable={!isGuest}
        />
        <Text style={styles.inputLabel}>Medical Conditions</Text>
        <Textarea
          placeholder="Any chronic conditions or health concerns..."
          value={medicalInfo.conditions}
          onChangeText={(v: string) => handleMedicalUpdate('conditions', v)}
          editable={!isGuest}
        />
        <Text style={styles.inputLabel}>Emergency Notes</Text>
        <Textarea
          placeholder="Important information for emergency responders..."
          value={medicalInfo.emergencyNotes}
          onChangeText={(v: string) => handleMedicalUpdate('emergencyNotes', v)}
          editable={!isGuest}
        />
      </Card>
      <Card style={{ backgroundColor: "#e5edf9", borderColor: "#bad1f8", padding: 12 }}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
          <Feather name="shield" size={18} color="#246BFD" style={{ marginTop: 2 }} />
          <View>
            <Text style={{ fontWeight: "500", fontSize: 13, marginBottom: 2 }}>Privacy & Security</Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              Medical information is encrypted and only shared with emergency services when you activate SOS.
              This data is not used for any other purposes.
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderSafetyChecksTab = () => (
    <View style={{ gap: 16 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Safety Check Settings</Text>
        <Badge variant={safetyChecks.enabled ? "default" : "secondary"}
          style={safetyChecks.enabled ? styles.enabledBadge : undefined}
          textStyle={safetyChecks.enabled ? styles.enabledBadgeText : undefined}
        >
          {safetyChecks.enabled ? "Active" : "Inactive"}
        </Badge>
      </View>
      <Card style={{ padding: 14 }}>
        <View style={styles.rowSpace}>
          <View>
            <Text style={styles.inputLabel}>Enable Safety Checks</Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              Automatically notify contacts if you don't respond
            </Text>
          </View>
          <Switch
            value={safetyChecks.enabled}
            onValueChange={checked => handleSafetyCheckToggle('enabled', checked)}
            disabled={isGuest}
          />
        </View>
        {safetyChecks.enabled && (
          <>
            <Text style={styles.inputLabel}>Check-in Interval (hours)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="4"
              value={String(safetyChecks.interval)}
              onChangeText={v => handleSafetyCheckToggle('interval', Number(v) || 1)}
              editable={!isGuest}
            />
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              How often you'll receive check-in reminders
            </Text>
            <View style={styles.rowSpace}>
              <View>
                <Text style={styles.inputLabel}>Reminder Notifications</Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  Get notified before each safety check
                </Text>
              </View>
              <Switch
                value={safetyChecks.reminderEnabled}
                onValueChange={checked => handleSafetyCheckToggle('reminderEnabled', checked)}
                disabled={isGuest}
              />
            </View>
          </>
        )}
      </Card>
      <Card style={{ backgroundColor: "#fef3c7", borderColor: "#fde68a", padding: 12 }}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
          <Feather name="alert-triangle" size={18} color="#f59e42" style={{ marginTop: 2 }} />
          <View>
            <Text style={{ fontWeight: "500", fontSize: 13, marginBottom: 2 }}>How Safety Checks Work</Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>
              • You'll receive periodic check-in notifications {"\n"}
              • If you don't respond within 15 minutes, contacts are alerted {"\n"}
              • Your location is shared with emergency contacts {"\n"}
              • Checks are automatically paused when you're in safe zones {"\n"}
              • You can manually trigger a check-in anytime
            </Text>
          </View>
        </View>
      </Card>
      {safetyChecks.enabled && !isGuest && (
        <Button
          style={{ backgroundColor: "#22c55e", marginTop: 12 }}
        //   textStyle={{ color: "#fff" }}
          onPress={() => Alert.alert('Manual check-in', 'Check-in triggered!')}
        >
          <Feather name="bell" size={17} style={{ marginRight: 4 }} /> Send Check-in Now
        </Button>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top", "left", "right"]}>
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      {/* Header */}
      <View style={styles.header}>
        <Button variant="ghost"  onPress={onBack}>
          <Feather name="arrow-left" size={24} />
        </Button>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Personal Safety</Text>
          <Text style={{ fontSize: 14, color: "#6b7280" }}>
            {isGuest
              ? "Limited access - sign in for full features"
              : "Manage your emergency information"}
          </Text>
        </View>
        <Feather name="heart" size={26} color="#ef4444" />
      </View>
      {/* Tab Navigation */}
      <View style={styles.tabs}>
        {tabOptions.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabBtn,
              activeTab === tab.key && styles.tabBtnActive
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <View style={{ alignItems: "center" }}>
              {tab.icon}
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab content */}
      <ScrollView contentContainerStyle={styles.scrollWrap}>
        {activeTab === 'contacts' ? renderContactsTab() : null}
        {activeTab === 'medical' ? renderMedicalTab() : null}
        {activeTab === 'checks' ? renderSafetyChecksTab() : null}
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    backgroundColor: "#fff"
  },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#246BFD",
    justifyContent: "center", alignItems: "center"
  },
  primaryBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 6,
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 11,
  },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 10, fontSize: 15,
  },
  inputLabel: { fontSize: 13, fontWeight: "500", color: "#222" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionHeaderTitle: { fontSize: 16, fontWeight: "bold" },
  enabledBadge: { backgroundColor: "#22c55e" },
  enabledBadgeText: { color: "#fff" },
  rowSpace: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tabs: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#e5e7eb" },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#246BFD" },
  tabLabel: { marginTop: 4, fontSize: 13, color: "#6b7280", fontWeight: "500" },
  tabLabelActive: { color: "#246BFD" },
  scrollWrap: { padding: 18, paddingBottom: 80 },
});

