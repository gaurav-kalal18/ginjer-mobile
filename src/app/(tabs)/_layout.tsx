
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Tabs, Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../lib/session';
import { C } from '../../theme';
import { demoDevices } from '../../lib/demo-devices';

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

  const [bannerVisible, setBannerVisible] = useState(false);

  const alertDevice = demoDevices.find(
    device => device.name === 'Cold Chain'
  );

  const openAlertDevice = () => {
    setBannerVisible(false);

    if (!alertDevice) return;

    router.push({
      pathname: '/device/[id]',
      params: { id: alertDevice._id },
    });
  };

  if (!ready) return null;

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={styles.container}>
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
        <Tabs.Screen
          name="devices"
          options={{ title: 'Devices' }}
        />
        <Tabs.Screen
          name="locations"
          options={{ title: 'Locations' }}
        />
        <Tabs.Screen
          name="analytics"
          options={{ title: 'Analytics' }}
        />
        <Tabs.Screen
          name="notifications"
          options={{ title: 'Alerts' }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'Profile' }}
        />
      </Tabs>

      {bannerVisible && (
        <View style={styles.banner}>
          <Pressable
            style={styles.bannerContent}
            onPress={openAlertDevice}
          >
            <View style={styles.alertIcon}>
              <Ionicons
                name="thermometer-outline"
                size={23}
                color="#EF4444"
              />
            </View>

            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                Temperature Alert
              </Text>

              <Text style={styles.bannerMessage}>
                Cold Chain temperature exceeded the demo threshold.
              </Text>

              <Text style={styles.bannerAction}>
                Tap to view device
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setBannerVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons
              name="close"
              size={20}
              color="#6B7280"
            />
          </Pressable>
        </View>
      )}

      {!bannerVisible && (
        <Pressable
          style={styles.demoTrigger}
          onPress={() => setBannerVisible(true)}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.triggerText}>
            Test Alert
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 8,
    zIndex: 100,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 11,
  },
  alertIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2D28',
  },
  bannerMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  bannerAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#608E12',
    marginTop: 3,
  },
  closeButton: {
    padding: 4,
    marginLeft: 6,
  },
  demoTrigger: {
    position: 'absolute',
    bottom: 85,
    right: 18,
    backgroundColor: '#86B817',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    elevation: 5,
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
