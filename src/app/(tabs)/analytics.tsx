
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenTitle, Empty } from '../../components/ui';
import { C } from '../../theme';

type Mode = 'demo' | 'live';

type Reading = {
  id: string;
  title: string;
  value: string;
  deviceId: string;
  time: string;
};

const demoReadings: Reading[] = [
  {
    id: '1',
    title: 'Desk occupancy',
    value: 'Occupied',
    deviceId: '24E124538D2870FF',
    time: 'Just now',
  },
  {
    id: '2',
    title: 'Valve Status',
    value: 'Off',
    deviceId: '24E124538D2870CC',
    time: '2 mins ago',
  },
  {
    id: '3',
    title: 'Temperature',
    value: '24.5 °C',
    deviceId: '24E124538D2870AA',
    time: '5 mins ago',
  },
  {
    id: '4',
    title: 'Air Quality',
    value: 'Good',
    deviceId: '24E124538D2870BB',
    time: '8 mins ago',
  },
];

function FillGauge({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const percentage = Math.min(
    100,
    Math.max(0, (value / max) * 100)
  );

  return (
    <View style={styles.gaugeWrapper}>
      <View style={styles.gaugeOuter}>
        <View style={styles.gaugeTrack} />
        <View
          style={[
            styles.gaugeFill,
            { width: `${percentage}%` },
          ]}
        />
      </View>

      <Text style={styles.gaugeValue}>
        {value.toFixed(2)}
      </Text>

      <View style={styles.gaugeLabels}>
        <Text style={styles.gaugeLabel}>0</Text>
        <Text style={styles.gaugeLabel}>{max}</Text>
      </View>
    </View>
  );
}

export default function AnalyticsPage() {
  const [mode, setMode] = useState<Mode>('demo');
  const [dashboard, setDashboard] = useState('Public Dashboard');
  const [showDashboards, setShowDashboards] = useState(false);

  const dashboards = [
    'Public Dashboard',
    'Device Overview',
    'Sensor Dashboard',
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
    >
      <ScreenTitle
        title="Analytics"
        subtitle="Monitor device performance"
      />

      <View style={styles.switchRow}>
        <Pressable
          onPress={() => setMode('demo')}
          style={[
            styles.switchButton,
            mode === 'demo' && styles.activeSwitch,
          ]}
        >
          <Text style={styles.switchText}>Demo Mode</Text>
        </Pressable>

        <Pressable
          onPress={() => setMode('live')}
          style={[
            styles.switchButton,
            mode === 'live' && styles.activeSwitch,
          ]}
        >
          <Text style={styles.switchText}>Live API</Text>
        </Pressable>
      </View>

      {mode === 'demo' ? (
        <>
          <Pressable
            style={styles.dropdown}
            onPress={() => setShowDashboards(!showDashboards)}
          >
            <Text style={styles.dropdownText}>
              {dashboard}
            </Text>
            <Ionicons
              name={
                showDashboards
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={20}
              color="#86B817"
            />
          </Pressable>

          {showDashboards && (
            <View style={styles.dropdownMenu}>
              {dashboards.map(item => (
                <Pressable
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setDashboard(item);
                    setShowDashboards(false);
                  }}
                >
                  <Text style={styles.dropdownText}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Waste Bin (Fill Level%)
            </Text>

            <FillGauge value={1.0} max={1.3} />

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                64E124538D2870CC
              </Text>
              <Text style={styles.footerText}>
                Demo reading
              </Text>
            </View>
          </View>

          {demoReadings.map(reading => (
            <View key={reading.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {reading.title}
              </Text>

              <Text style={styles.readingValue}>
                {reading.value}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>
                  {reading.deviceId}
                </Text>
                <Text style={styles.footerText}>
                  {reading.time}
                </Text>
              </View>
            </View>
          ))}

          <Text style={styles.demoNote}>
            Demo dashboard — all readings are simulated.
          </Text>
        </>
      ) : (
        <Empty
          icon="stats-chart-outline"
          title="No live analytics available"
          description="Live readings will appear when the Ginjer reporting API and sensor data are available."
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
  gap: 12,
},
  switchRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
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
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7E3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2D28',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7E3',
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7E3',
    minHeight: 145,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2D28',
  },
  readingValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1F2D28',
    marginVertical: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#A0A6A2',
    flexShrink: 1,
  },
  gaugeWrapper: {
    alignItems: 'center',
    marginVertical: 25,
  },
  gaugeOuter: {
    width: 220,
    height: 25,
    backgroundColor: '#EDF0F5',
    borderRadius: 20,
    overflow: 'hidden',
  },
  gaugeTrack: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EDF0F5',
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#87CEEB',
    borderRadius: 20,
  },
  gaugeValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2D28',
    marginTop: 12,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    marginTop: 6,
  },
  gaugeLabel: {
    fontSize: 12,
    color: '#808783',
  },
  demoNote: {
    fontSize: 12,
    color: '#808783',
    textAlign: 'center',
    marginTop: 10,
  },
});
