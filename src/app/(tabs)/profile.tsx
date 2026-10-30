
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../lib/session';
import { C } from '../../theme';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
};

export default function Profile() {
  const {
    user,
    org,
    project,
    signOut,
    selectOrg,
    selectProject,
  } = useSession();

  const [editing, setEditing] = useState(false);
  const [orgModal, setOrgModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
  });

  const [preview, setPreview] = useState<ProfileForm | null>(
    null
  );

  useEffect(() => {
    if (!user) {
      setPreview(null);
      setEditing(false);
    }
  }, [user]);

  const display = preview ?? {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.emailId ?? '',
    primaryPhone: '',
    secondaryPhone: '',
  };

  const fullName =
    `${display.firstName} ${display.lastName}`.trim() ||
    'Ginjer User';

  const initials =
    (
      (display.firstName[0] ?? '') +
      (display.lastName[0] ?? '')
    ).toUpperCase() || 'G';

  function openEditor() {
    setForm({ ...display });
    setEditing(true);
  }

  function applyPreview() {
    if (!form.firstName.trim()) {
      Alert.alert(
        'First name required',
        'Please enter your first name.'
      );
      return;
    }

    if (!form.email.trim()) {
      Alert.alert(
        'Email required',
        'Please enter your email address.'
      );
      return;
    }

    setPreview({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    });

    setEditing(false);
  }

  function requestLogout() {
    setLogoutModal(true);
  }

  async function confirmLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut();

      setPreview(null);
      setEditing(false);
      setOrgModal(false);
      setLogoutModal(false);

      router.replace('/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);

      setLogoutModal(false);

      Alert.alert(
        'Logout failed',
        'Please try signing out again.'
      );
    } finally {
      setLoggingOut(false);
    }
  }

  const update = (
    key: keyof ProfileForm,
    value: string
  ) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }));
  };

  if (editing) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.editHeader}>
          <Pressable
            onPress={() => setEditing(false)}
            style={styles.iconButton}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={C.ink}
            />
          </Pressable>

          <Text style={styles.editTitle}>
            Edit Profile
          </Text>

          <Pressable
            onPress={applyPreview}
            style={styles.iconButton}
          >
            <Ionicons
              name="checkmark"
              size={24}
              color={C.greenDark}
            />
          </Pressable>
        </View>

        <View style={styles.editAvatar}>
          <Ionicons
            name="person"
            size={50}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.previewNote}>
          Preview only — changes are not saved to Ginjer.
        </Text>

        <ProfileField
          label="First Name"
          icon="person-outline"
          value={form.firstName}
          onChangeText={value =>
            update('firstName', value)
          }
        />

        <ProfileField
          label="Last Name"
          icon="person-outline"
          value={form.lastName}
          onChangeText={value =>
            update('lastName', value)
          }
        />

        <ProfileField
          label="Email"
          icon="mail-outline"
          value={form.email}
          onChangeText={value =>
            update('email', value)
          }
          keyboardType="email-address"
        />

        <ProfileField
          label="Primary Phone Number"
          icon="call-outline"
          value={form.primaryPhone}
          onChangeText={value =>
            update('primaryPhone', value)
          }
          keyboardType="phone-pad"
        />

        <ProfileField
          label="Secondary Phone Number"
          icon="call-outline"
          value={form.secondaryPhone}
          onChangeText={value =>
            update('secondaryPhone', value)
          }
          keyboardType="phone-pad"
        />

        <View style={styles.fieldBoxDisabled}>
          <Text style={styles.fieldLabel}>
            Organization
          </Text>

          <View style={styles.fieldRow}>
            <Ionicons
              name="business-outline"
              size={22}
              color={C.muted}
            />

            <Text style={styles.disabledValue}>
              {org?.name ?? 'No organization selected'}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={applyPreview}
        >
          <Text style={styles.primaryButtonText}>
            Apply Preview
          </Text>
        </Pressable>

        <Text style={styles.bottomNote}>
          Profile changes are local previews until
          the Ginjer profile-update API is connected.
        </Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.pageTitle}>
          Profile
        </Text>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>
              {initials}
            </Text>
          </View>

          <View style={styles.identityText}>
            <Text style={styles.name}>
              {fullName}
            </Text>

            <Text style={styles.email}>
              {display.email}
            </Text>
          </View>
        </View>

        <View style={styles.menu}>
          <MenuRow
            icon="person-outline"
            title="My Profile"
            subtitle="View and edit your details"
            onPress={openEditor}
          />

          <View style={styles.separator} />

          <MenuRow
            icon="grid-outline"
            title="Projects"
            subtitle={
              project?.name ?? 'Select a project'
            }
            onPress={() => router.push('/projects')}
          />

          <View style={styles.separator} />

          <MenuRow
            icon="business-outline"
            title="Organizations"
            subtitle={
              org?.name ?? 'Select an organization'
            }
            onPress={() => setOrgModal(true)}
          />
        </View>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={C.greenDark}
          />

          <Text style={styles.noticeText}>
            Organization changes use your Ginjer account.
            Profile edits are local previews until a
            profile-update API is available.
          </Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={requestLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>

          <Ionicons
            name="log-out-outline"
            size={24}
            color="#F04444"
          />
        </Pressable>
      </ScrollView>

      {/* Organization selector */}
      <Modal
        visible={orgModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOrgModal(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setOrgModal(false)}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Organizations
              </Text>

              <Pressable
                onPress={() => setOrgModal(false)}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color={C.ink}
                />
              </Pressable>
            </View>

            <Text style={styles.sheetDescription}>
              Current organization
            </Text>

            {org ? (
              <Pressable
                style={styles.organizationRow}
                onPress={() => {
                  selectOrg(org);
                  setOrgModal(false);
                }}
              >
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={C.greenDark}
                />

                <Text style={styles.organizationName}>
                  {org.name}
                </Text>

                <Ionicons
                  name="checkmark-circle"
                  size={23}
                  color={C.green}
                />
              </Pressable>
            ) : (
              <Text style={styles.emptyText}>
                No organization selected.
              </Text>
            )}

            <Text style={styles.sheetFootnote}>
              This panel shows your current organization.
              Switching to other organizations requires
              loading the full organization list.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Logout confirmation */}
      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!loggingOut) {
            setLogoutModal(false);
          }
        }}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Ionicons
                name="log-out-outline"
                size={30}
                color="#F04444"
              />
            </View>

            <Text style={styles.confirmTitle}>
              Log out?
            </Text>

            <Text style={styles.confirmDescription}>
              You will be signed out of your Ginjer
              account on this device.
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                style={styles.cancelButton}
                disabled={loggingOut}
                onPress={() =>
                  setLogoutModal(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.confirmLogoutButton}
                disabled={loggingOut}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmLogoutText}>
                  {loggingOut
                    ? 'Logging out...'
                    : 'Logout'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type ProfileFieldProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: React.ComponentProps<
    typeof TextInput
  >['keyboardType'];
};

function ProfileField({
  label,
  icon,
  value,
  onChangeText,
  keyboardType,
}: ProfileFieldProps) {
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View style={styles.fieldRow}>
        <Ionicons
          name={icon}
          size={22}
          color={C.ink}
        />

        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={
            keyboardType === 'email-address'
              ? 'none'
              : 'sentences'
          }
          placeholderTextColor={C.muted}
        />
      </View>
    </View>
  );
}

type MenuRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
};

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
}: MenuRowProps) {
  return (
    <Pressable
      style={styles.menuRow}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={25}
        color={C.greenDark}
      />

      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={23}
        color={C.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    width: '100%',
    maxWidth: 570,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 65,
    gap: 22,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: C.ink,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginVertical: 12,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#293331',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
  },
  identityText: {
    flex: 1,
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    color: C.ink,
  },
  email: {
    marginTop: 7,
    fontSize: 13,
    color: C.muted,
  },
  menu: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    minHeight: 86,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },
  menuSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: C.muted,
  },
  separator: {
    height: 1,
    backgroundColor: C.line,
    marginLeft: 44,
  },
  notice: {
    backgroundColor: C.greenPale,
    borderRadius: 15,
    padding: 17,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    color: C.greenDark,
  },
  logoutButton: {
    marginTop: 28,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 15,
    padding: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutText: {
    color: '#F04444',
    fontSize: 16,
    fontWeight: '800',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.ink,
  },
  editAvatar: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#849487',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  previewNote: {
    textAlign: 'center',
    color: C.greenDark,
    fontSize: 13,
    marginBottom: 4,
  },
  fieldBox: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#ADB8B1',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  fieldBoxDisabled: {
    backgroundColor: '#F0F2F0',
    borderWidth: 1,
    borderColor: '#ADB8B1',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    color: C.greenDark,
    fontSize: 12,
    fontWeight: '700',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minHeight: 42,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: C.ink,
    paddingVertical: 8,
    ...(Platform.OS === 'web'
      ? { outlineStyle: 'none' as any }
      : {}),
  },
  disabledValue: {
    fontSize: 15,
    color: C.muted,
  },
  primaryButton: {
    backgroundColor: C.green,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  bottomNote: {
    fontSize: 12,
    textAlign: 'center',
    color: C.muted,
    lineHeight: 19,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  bottomSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  sheetHandle: {
    width: 52,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#D5D9D5',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.ink,
  },
  sheetDescription: {
    marginTop: 20,
    fontSize: 13,
    color: C.muted,
  },
  organizationRow: {
    marginTop: 15,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.greenPale,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  organizationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  emptyText: {
    marginTop: 20,
    color: C.muted,
  },
  sheetFootnote: {
    marginTop: 22,
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FDEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: C.ink,
  },
  confirmDescription: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 21,
    color: C.muted,
  },
  confirmActions: {
    marginTop: 25,
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '800',
    color: C.ink,
  },
  confirmLogoutButton: {
    flex: 1,
    backgroundColor: '#F04444',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  confirmLogoutText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
