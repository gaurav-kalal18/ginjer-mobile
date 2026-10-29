
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../theme';
import {
  ErrorNote,
  Loading,
  Panel,
  ScreenTitle,
  Empty,
} from '../../components/ui';
import { useData } from '../../hooks/useData';
import { ProjectDevices, Q } from '../../lib/api';
import { demoDevices } from '../../lib/demo-devices';
import { useSession } from '../../lib/session';
import BusylightControl from '../../components/devices/BusylightControl';

export default function DeviceDetails() {
    const { user } = useSession();
  const p = useLocalSearchParams<{
    id: string;
    projectId?: string;
    organisationId?: string;
  }>();

  const isDemo = p.id?.startsWith('demo-') ?? false;

  const { data, loading, error } = useData<{
    projects: ProjectDevices[];
  }>(
    Q.details,
    {
      params: {
        organisationId: p.organisationId,
        projectId: p.projectId,
      },
    },
    !isDemo && !!p.projectId && !!p.organisationId
  );

  const demoDevice = isDemo
    ? demoDevices.find(d => d._id === p.id)
    : undefined;

  const liveDevice = !isDemo
    ? data?.projects
        ?.flatMap(project => project.clusters || [])
        .flatMap(cluster => cluster.devices || [])
        .find(device => device._id === p.id)
    : undefined;

  const device = demoDevice || liveDevice;

  const information = device
    ? [
        ['Device EUI', device.devEui],
        ['Hardware type', device.hardwareType],
        [
          'Last heard',
          demoDevice
            ? demoDevice.lastHeard
            : liveDevice?.timestamp,
        ],
        [
          'Location',
          liveDevice?.position?.placeName,
        ],
      ]
    : [];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
    >
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={C.ink}
        />
        <Text style={styles.backText}>Devices</Text>
      </Pressable>

      {!isDemo && loading ? (
        <Loading />
      ) : !isDemo && error ? (
        <ErrorNote message={error} />
      ) : !device ? (
        <Empty
          icon="hardware-chip-outline"
          title="Device not found"
          description="Refresh the device list and try again."
        />
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons
                name={
                  demoDevice?.hardwareType === 'light'
                    ? 'bulb-outline'
                    : 'hardware-chip-outline'
                }
                size={35}
                color={C.greenDark}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>
                {device.name}
              </Text>
              <Text style={styles.deviceId}>
                {device.devEui || 'Connected device'}
              </Text>
            </View>
          </View>

          {isDemo && (
            <View style={styles.demoBanner}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={C.greenDark}
              />
              <Text style={styles.demoText}>
                Demo Mode — sample data, not connected
                to physical hardware.
              </Text>
            </View>
          )}

          <Panel>
            <Text style={styles.section}>
              Device information
            </Text>

            {information.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>
                  {value || '—'}
                </Text>
              </View>
            ))}
          </Panel>

          {demoDevice ? (
            <>
              <Panel>
                <Text style={styles.section}>
                  Device status
                </Text>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Current status
                  </Text>
                  <View style={styles.statusGroup}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            demoDevice.color,
                        },
                      ]}
                    />
                    <Text style={styles.value}>
                      {demoDevice.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Secondary status
                  </Text>
                  <Text style={styles.value}>
                    {demoDevice.secondaryStatus}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>
                    Battery
                  </Text>
                  <Text style={styles.value}>
                    {demoDevice.battery}
                  </Text>
                </View>
              </Panel>
{demoDevice.hardwareType === 'light' && (
  <BusylightControl mode="demo" />
)}
            </>
          ) : (
            <>
              <Panel>
                <Text style={styles.section}>
                  Outputs
                </Text>

                {liveDevice?.outputs?.length ? (
                  liveDevice.outputs.map(output => (
                    <View
                      key={output.outputId}
                      style={styles.row}
                    >
                      <Text style={styles.label}>
                        {output.outputName}
                      </Text>
                      <Text style={styles.value}>
                        {String(output.value ?? '—')}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.description}>
                    No outputs reported
                  </Text>
                )}
              </Panel>

              <Panel>
                <Text style={styles.section}>
                  Attributes
                </Text>

                {liveDevice?.attributes?.length ? (
                  liveDevice.attributes.map(attribute => (
                    <View
                      key={attribute.attributeId}
                      style={styles.row}
                    >
                      <Text style={styles.label}>
                        {attribute.attributeName}
                      </Text>
                      <Text style={styles.value}>
                        {String(attribute.value ?? '—')}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.description}>
                    No attributes reported
                  </Text>
                )}
              </Panel>

              {liveDevice?.name?.toLowerCase().includes('busylight') ? (
  <BusylightControl
    mode="live"
    deviceId={liveDevice._id}
    organisationId={p.organisationId}
    token={user?.token}
  />
) : (
  <Panel style={styles.controlPanel}>
    <Text style={styles.section}>Device control</Text>
    <Text style={styles.description}>
      Controls are not configured for this device.
    </Text>
  </Panel>
)}
            </>
          )}
        </>
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
    padding: 22,
    paddingTop: 54,
    paddingBottom: 45,
    gap: 16,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 8,
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: C.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 23,
    fontWeight: '800',
    color: C.ink,
  },
  deviceId: {
    fontSize: 13,
    color: C.muted,
    marginTop: 6,
  },
  demoBanner: {
    backgroundColor: C.greenPale,
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demoText: {
    flex: 1,
    color: C.greenDark,
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    fontWeight: '800',
    fontSize: 17,
    color: C.ink,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: C.muted,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: C.ink,
    flex: 1,
    textAlign: 'right',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  description: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 21,
  },
  controlPanel: {
    backgroundColor: C.greenPale,
  },
});
