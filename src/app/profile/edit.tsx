
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { gql, Q, Org } from '../../lib/api';
import { useSession } from '../../lib/session';
import { C } from '../../theme';

export default function EditProfile() {
  const { user, org, selectOrg } = useSession();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.emailId || '');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [search, setSearch] = useState('');
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const filteredOrganizations = useMemo(
    () =>
      organizations.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [organizations, search]
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  const openOrganizations = async () => {
    setModalVisible(true);

    if (organizations.length > 0) return;

    try {
      setLoadingOrgs(true);

      const response = await gql<{ accounts: Org[] }>(
        Q.orgs,
        {},
        user?.token
      );

      setOrganizations(response.accounts || []);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Could not load organizations.'
      );
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Required fields', 'Please fill in your name and email.');
      return;
    }

    Alert.alert(
      'Demo Mode',
      'Your details are ready. Profile updates are not connected to the backend yet.'
    );
  };

  const chooseOrganization = (item: Org) => {
    selectOrg(item);
    setModalVisible(false);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={23} color={C.ink} />
          </Pressable>

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <Pressable onPress={handleSave} hitSlop={12}>
            <Ionicons name="checkmark" size={25} color={C.ink} />
          </Pressable>
        </View>

        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={43} color={C.white} />
          </View>

          <View style={styles.badge}>
            <Ionicons name="checkmark" size={11} color={C.white} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <ProfileField
            label="First Name"
            icon="person-outline"
            value={firstName}
            onChangeText={setFirstName}
          />

          <ProfileField
            label="Last Name"
            icon="person-outline"
            value={lastName}
            onChangeText={setLastName}
          />

          <ProfileField
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <ProfileField
            label="Primary Phone Number"
            icon="phone-portrait-outline"
            value={primaryPhone}
            onChangeText={setPrimaryPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <ProfileField
            label="Secondary Phone Number"
            icon="phone-portrait-outline"
            value={secondaryPhone}
            onChangeText={setSecondaryPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          {/* Organization selector */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Organization</Text>

            <Pressable
              style={styles.inputContainer}
              onPress={openOrganizations}
            >
              <Ionicons
                name="business-outline"
                size={17}
                color={C.ink}
              />

              <Text
                style={[
                  styles.organizationText,
                  !org?.name && { color: C.muted },
                ]}
              >
                {org?.name || 'Select an organization'}
              </Text>

              <Ionicons
                name="chevron-down"
                size={17}
                color={C.muted}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Organization Bottom Sheet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Organization</Text>

              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={C.ink} />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={C.muted} />

              <TextInput
                style={styles.searchInput}
                placeholder="Search Organization"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={C.muted}
              />
            </View>

            {loadingOrgs ? (
              <ActivityIndicator
                color={C.green}
                style={{ marginVertical: 25 }}
              />
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                {filteredOrganizations.map(item => (
                  <Pressable
                    key={item.organisationId}
                    style={[
                      styles.organizationRow,
                      org?.organisationId === item.organisationId &&
                        styles.selectedOrganization,
                    ]}
                    onPress={() => chooseOrganization(item)}
                  >
                    <Ionicons
                      name="business"
                      size={19}
                      color={C.ink}
                    />

                    <Text style={styles.organizationName}>
                      {item.name}
                    </Text>

                    {org?.organisationId === item.organisationId && (
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color={C.green}
                      />
                    )}
                  </Pressable>
                ))}

                {!filteredOrganizations.length && (
                  <Text style={styles.emptyText}>
                    No organizations found.
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProfileField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={17} color={C.ink} />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={
            keyboardType === 'email-address' ? 'none' : 'words'
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 35,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.ink,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 35,
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D8DED6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 16,
  },
  field: {
    position: 'relative',
  },
  fieldLabel: {
    color: C.greenDark,
    fontSize: 11,
    marginBottom: 5,
    marginLeft: 5,
  },
  inputContainer: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 7,
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: C.ink,
    paddingVertical: 10,
  },
  organizationText: {
    flex: 1,
    fontSize: 13,
    color: C.ink,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottomSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
    maxHeight: '65%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.ink,
  },
  searchBox: {
    height: 43,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.ink,
  },
  organizationRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    borderRadius: 7,
  },
  selectedOrganization: {
    backgroundColor: C.greenPale,
  },
  organizationName: {
    flex: 1,
    fontSize: 14,
    color: C.ink,
  },
  emptyText: {
    textAlign: 'center',
    color: C.muted,
    paddingVertical: 22,
  },
});
