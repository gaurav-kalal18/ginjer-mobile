
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../../theme';
import {
  ErrorNote,
  Loading,
  Panel,
  Empty,
} from '../../components/ui';
import { useData } from '../../hooks/useData';
import { ProjectDevices, Q } from '../../lib/api';
import { demoDevices } from '../../lib/demo-devices';
import { useSession } from '../../lib/session';
import BusylightControl, {
  LightColor,
} from '../../components/devices/BusylightControl';

const COLOR_OPTIONS: {
  name: LightColor;
  hex: string;
}[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#86B817' },
  { name: 'Off', hex: '#9CA3AF' },
];

export default function DeviceDetails() {
  const { user } = useSession();

  const [downlinkOpen, setDownlinkOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedColor, setSelectedColor] =
    useState<LightColor | null>(null);
  const [appliedColor, setAppliedColor] =
    useState<LightColor>('Off');

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

  const isBusylight =
    !!device &&
    (device.name.toLowerCase().includes('busylight') ||
      (isDemo && demoDevice?.hardwareType === 'light'));

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
        ['Location', liveDevice?.position?.placeName],
      ]
    : [];

  const closeSheet = () => {
    setDownlinkOpen(false);
    setDropdownOpen(false);
  };

  const openSheet = () => {
    setSelectedColor(null);
    setDropdownOpen(false);
    setDownlinkOpen(true);
  };

  const sendDemoCommand = () => {
    if (!selectedColor || !isBusylight) return;

    if (!isDemo) {
      Alert.alert(
        'Live Control Not Enabled',
        'We must verify the Ginjer hardware command payload before sending real downlinks.'
      );
      return;
    }

    setAppliedColor(selectedColor);
    closeSheet();

    Alert.alert(
      'Demo Downlink Sent',
      `Busylight colour changed to ${selectedColor} in simulation only. No physical command was sent.`
    );
  };

  const previewHex =
    COLOR_OPTIONS.find(c => c.name === selectedColor)?.hex ??
    '#9CA3AF';

  return (
    <>
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
                    isBusylight
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

            {isBusylight && (
              <Pressable
                style={styles.downlinkButton}
                onPress={openSheet}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.downlinkButtonText}>
                  Send Downlink
                </Text>
              </Pressable>
            )}

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

                {isBusylight && (
                  <BusylightControl
                    mode="demo"
                    appliedColor={appliedColor}
                    onDemoColorChange={setAppliedColor}
                  />
                )}
              </>
            ) : (
              <>
                <Panel>
                  <Text style={styles.section}>Outputs</Text>

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

                {isBusylight ? (
                  <BusylightControl
                    mode="live"
                    deviceId={liveDevice?._id}
                    organisationId={p.organisationId}
                    token={user?.token}
                  />
                ) : (
                  <Panel style={styles.controlPanel}>
                    <Text style={styles.section}>
                      Device control
                    </Text>
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

      <Modal
        visible={downlinkOpen}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeSheet}
          />

          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>
              Send Downlink
            </Text>

            <Text style={styles.sheetDescription}>
              Select a command to send to your device.
            </Text>

            <View style={styles.sheetIcon}>
              <Ionicons
                name="cloud-upload-outline"
                size={50}
                color={C.green}
              />
            </View>

            <Text style={styles.sheetLabel}>Device</Text>

            <View style={styles.sheetField}>
              <Text style={styles.sheetFieldText}>
                {device?.name || 'Device'}
              </Text>
              <Ionicons
                name="hardware-chip-outline"
                size={18}
                color={C.greenDark}
              />
            </View>

            <Text style={styles.sheetLabel}>Command</Text>

            <Pressable
              style={styles.sheetField}
              onPress={() => setDropdownOpen(v => !v)}
            >
              <Text
                style={
                  selectedColor
                    ? styles.sheetFieldText
                    : styles.sheetPlaceholder
                }
              >
                {selectedColor
                  ? `Set Colour — ${selectedColor}`
                  : 'Select command'}
              </Text>
              <Ionicons
                name={
                  dropdownOpen
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={18}
                color={C.greenDark}
              />
            </Pressable>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                {COLOR_OPTIONS.map(color => (
                  <Pressable
                    key={color.name}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedColor(color.name);
                      setDropdownOpen(false);
                    }}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: color.hex },
                      ]}
                    />
                    <Text style={styles.dropdownText}>
                      {color.name}
                    </Text>
                    {selectedColor === color.name && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={C.greenDark}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.lightPreview}>
              <Ionicons
                name="bulb"
                size={58}
                color={previewHex}
              />
              <Text style={styles.previewLabel}>
                {selectedColor
                  ? `Selected: ${selectedColor}`
                  : 'Choose a colour'}
              </Text>
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeSheet}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.sendButton,
                  (!selectedColor || !isDemo) &&
                    styles.sendButtonDisabled,
                ]}
                disabled={!selectedColor || !isDemo}
                onPress={sendDemoCommand}
              >
                <Text style={styles.sendText}>Send</Text>
              </Pressable>
            </View>

            <Text style={styles.sheetNote}>
              {isDemo
                ? 'Demo Mode — no physical hardware commands are sent.'
                : 'Live commands disabled until the hardware payload is verified.'}
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
  downlinkButton: {
    backgroundColor: C.green,
    paddingVertical: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 4,
  },
  downlinkButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1F2D28',
  },
  sheetDescription: {
    textAlign: 'center',
    fontSize: 12,
    color: '#808783',
    marginTop: 10,
  },
  sheetIcon: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  sheetLabel: {
    fontSize: 12,
    color: C.greenDark,
    marginBottom: 7,
    fontWeight: '700',
  },
  sheetField: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sheetFieldText: {
    color: '#1F2D28',
    fontSize: 14,
    flexShrink: 1,
  },
  sheetPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E5E7E3',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3EF',
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2D28',
    fontWeight: '600',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  lightPreview: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  previewLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#808783',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.green,
    borderRadius: 11,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: C.greenDark,
    fontWeight: '800',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#86B817',
    borderRadius: 11,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B2D17E',
    opacity: 0.65,
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sheetNote: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
  },
});
