
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSession } from '../../lib/session';
import { C } from '../../theme';

export default function Profile() {
  const { user, org, signOut } = useSession();

  const MenuItem = ({
    icon,
    title,
    onPress,
  }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    onPress: () => void;
  }) => (
    <Pressable style={s.menuItem} onPress={onPress}>
      <View style={s.menuLeft}>
        <Ionicons name={icon} size={19} color={C.greenDark} />
        <Text style={s.menuText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </Pressable>
  );

  async function handleSignOut() {
    await signOut();
    router.replace('/sign-in');
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Heading */}
      <Text style={s.heading}>Profile</Text>

      {/* User information */}
      <View style={s.userSection}>
        <View style={s.avatar}>
          <Ionicons name="person" size={34} color={C.white} />
        </View>

        <View style={s.userInfo}>
          <Text style={s.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={s.email}>{user?.emailId}</Text>
        </View>
      </View>

      {/* Profile menu */}
      <View style={s.menuCard}>
        <MenuItem
          icon="person-outline"
          title="My Profile"
          onPress={() => router.push('/profile/edit')}
        />

        <View style={s.separator} />

        <MenuItem
          icon="grid-outline"
          title="Projects"
          onPress={() => router.push('/(tabs)/devices')}
        />

        <View style={s.separator} />

        <MenuItem
          icon="business-outline"
          title="Organizations"
          onPress={() => router.push('/(tabs)/devices')}
        />
      </View>

      {/* Current organization */}
      <View style={s.orgCard}>
        <Text style={s.orgLabel}>CURRENT ORGANIZATION</Text>
        <Text style={s.orgName}>
          {org?.name || 'No organization selected'}
        </Text>
      </View>

      {/* Logout */}
      <Pressable style={s.logout} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={19} color={C.danger} />
        <Text style={s.logoutText}>Logout</Text>
      </Pressable>

      <Text style={s.footer}>Powered by Ginjer</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 35,
  },
  heading: {
    fontSize: 27,
    fontWeight: '800',
    color: C.ink,
    backgroundColor: C.white,
    padding: 15,
    borderRadius: 9,
    marginBottom: 25,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: C.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: C.ink,
  },
  email: {
    fontSize: 12,
    color: C.muted,
    marginTop: 5,
  },
  menuCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: C.line,
  },
  menuItem: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.ink,
  },
  separator: {
    height: 1,
    backgroundColor: C.line,
  },
  orgCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    padding: 17,
    marginTop: 20,
  },
  orgLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.7,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
    marginTop: 8,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 16,
    marginTop: 25,
  },
  logoutText: {
    color: C.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 12,
    marginTop: 30,
  },
});
