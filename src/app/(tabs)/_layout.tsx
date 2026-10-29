
import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../lib/session';
import { C } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icons: Record<string, IconName> = {
  devices: 'hardware-chip-outline',
  locations: 'map-outline',
  analytics: 'stats-chart-outline',
  notifications: 'notifications-outline',
  profile: 'person-circle-outline',
};

export default function TabsLayout() {
  const { user, ready } = useSession();

  if (!ready) return null;

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: C.greenDark,
        tabBarInactiveTintColor: C.muted,

        tabBarStyle: {
          height: 64,
          paddingTop: 7,
          paddingBottom: 8,
          backgroundColor: C.white,
          borderTopColor: C.line,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },

        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={icons[route.name] || 'ellipse-outline'}
            color={String(color)}
            size={size}
          />
        ),
      })}
    >
      <Tabs.Screen name="devices" options={{ title: 'Devices' }} />
      <Tabs.Screen name="locations" options={{ title: 'Locations' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
