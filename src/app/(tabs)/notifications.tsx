
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenTitle, Empty } from '../../components/ui';
import { C } from '../../theme';
import { router } from 'expo-router';
import { demoDevices } from '../../lib/demo-devices';

type Mode = 'demo' | 'live';
type Filter = 'all' | 'unread' | 'critical';
type Severity = 'critical' | 'warning' | 'info' | 'success';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  device: string;
  time: string;
  severity: Severity;
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Temperature Alert',
    message: 'Cold Chain temperature exceeded the demo threshold.',
    device: 'Cold Chain',
    time: '2 min ago',
    severity: 'critical',
    read: false,
  },
  {
    id: '2',
    title: 'Panic Button Triggered',
    message: 'A demo emergency button event was detected.',
    device: 'Panic Button',
    time: '10 min ago',
    severity: 'critical',
    read: false,
  },
  {
    id: '3',
    title: 'Low Battery',
    message: 'Level Sensor battery level is below 20%.',
    device: 'Level Sensor',
    time: '30 min ago',
    severity: 'warning',
    read: false,
  },
  {
    id: '4',
    title: 'Device Connected',
    message: 'Busylight is connected in the simulated environment.',
    device: 'Busylight',
    time: '1 hour ago',
    severity: 'success',
    read: true,
  },
  {
    id: '5',
    title: 'Air Quality Update',
    message: 'Air quality is within the normal demo range.',
    device: 'Air Quality Sensor',
    time: '2 hours ago',
    severity: 'info',
    read: true,
  },
  {
    id: '6',
    title: 'Controller Status',
    message: 'IO Controller completed its simulated status check.',
    device: 'IO Controller',
    time: 'Yesterday',
    severity: 'success',
    read: true,
  },
];

const severityColors: Record<Severity, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#86B817',
};

export default function NotificationsPage() {
  const [mode, setMode] = useState<Mode>('demo');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [notifications, setNotifications] =
    useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter(n => {
      const matchesSearch = `${n.title} ${n.message} ${n.device}`
        .toLowerCase()
        .includes(query);
      const matchesFilter = filter === 'all' ||
        (filter === 'unread' && !n.read) ||
        (filter === 'critical' && n.severity === 'critical');
      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const markRead = (id: string) => {
    setNotifications(current =>
      current.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllRead = () => {
    setNotifications(current =>
      current.map(n => ({ ...n, read: true }))
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenTitle
        title="Notifications"
        subtitle="Device alerts and activity"
      />

      <View style={styles.switchRow}>
        {(['demo', 'live'] as Mode[]).map(item => (
          <Pressable
            key={item}
            onPress={() => setMode(item)}
            style={[
              styles.switchButton,
              mode === item && styles.activeSwitch,
            ]}
          >
            <Text
              style={[
                styles.switchText,
                mode === item && styles.activeSwitchText,
              ]}
            >
              {item === 'demo' ? 'Demo Mode' : 'Live API'}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'demo' ? (
        <>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#808783"
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search notifications"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color="#9CA3AF"
                />
              </Pressable>
            )}
          </View>

          <View style={styles.demoBanner}>
            <Ionicons name="information-circle-outline" size={19} color={C.greenDark} />
            <Text style={styles.demoBannerText}>
              Demo Mode — sample notifications, not live Ginjer events.
            </Text>
          </View>

          <View style={styles.filterRow}>
            {(['all', 'unread', 'critical'] as Filter[]).map(option => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === option }}
                onPress={() => setFilter(option)}
                style={[styles.filterChip, filter === option && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
                  {option === 'all' ? 'All' : option === 'unread' ? 'Unread' : 'Critical'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {filtered.length} Notifications
              {unreadCount > 0 ? ` • ${unreadCount} unread` : ''}
            </Text>

            <Pressable onPress={markAllRead}>
              <Text style={styles.markAll}>
                Mark all as read
              </Text>
            </Pressable>
          </View>

          {filtered.length === 0 ? (
            <Empty
              icon="notifications-outline"
              title="No matching notifications"
              description="Try a different search or filter."
            />
          ) : (
            filtered.map(item => (
              <Pressable
                key={item.id}
                onPress={() => {
  markRead(item.id);

  const device = demoDevices.find(
    d => d.name.toLowerCase() === item.device.toLowerCase()
  );

  if (device) {
    router.push({
      pathname: '/device/[id]',
      params: {
        id: device._id,
        demo: 'true',
      },
    });
  }
}}
                style={[
                  styles.card,
                  !item.read && styles.unreadCard,
                ]}
              >
                <View
                  style={[
                    styles.severityIcon,
                    {
                      backgroundColor:
                        severityColors[item.severity] + '18',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.severity === 'critical'
                        ? 'alert-circle-outline'
                        : item.severity === 'warning'
                          ? 'warning-outline'
                          : item.severity === 'success'
                            ? 'checkmark-circle-outline'
                            : 'information-circle-outline'
                    }
                    size={25}
                    color={severityColors[item.severity]}
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>
                      {item.title}
                    </Text>

                    {!item.read && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>

                  <Text style={styles.message}>
                    {item.message}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.deviceName}>
                      {item.device}
                    </Text>
                    <Text style={styles.time}>
                      {item.time}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}

          <Text style={styles.demoNote}>
  Demo notifications are simulated.
  Tap a notification to open its associated device.
</Text>
        </>
      ) : (
        <Empty
          icon="notifications-outline"
          title="No live notifications available"
          description="The supplied Ginjer API collection does not include a notifications endpoint."
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    padding: 22,
    paddingTop: 55,
    paddingBottom: 45,
    gap: 13,
  },
  demoBanner: {
    backgroundColor: C.greenPale,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  demoBannerText: {
    flex: 1,
    color: C.greenDark,
    fontSize: 12,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D7E8BA',
    backgroundColor: C.white,
  },
  filterChipActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  filterText: {
    color: C.greenDark,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: C.white,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#E9EDE5',
  },
  activeSwitch: {
    backgroundColor: '#86B817',
  },
  switchText: {
    color: '#1F2D28',
    fontSize: 13,
    fontWeight: '700',
  },
  activeSwitchText: {
    color: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5E7E3',
    paddingHorizontal: 14,
    minHeight: 49,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2D28',
    paddingVertical: 10,
    outlineStyle: 'none',
  } as any,
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    gap: 8,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2D28',
  },
  markAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#608E12',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7E3',
    gap: 12,
  },
  unreadCard: {
    borderColor: '#D7E8BA',
    backgroundColor: '#FCFEF8',
  },
  severityIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 7,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2D28',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#86B817',
  },
  message: {
    fontSize: 12,
    color: '#6B756F',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  deviceName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#608E12',
    flexShrink: 1,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  demoNote: {
    fontSize: 12,
    color: '#808783',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
  },
});
