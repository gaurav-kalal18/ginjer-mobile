import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { C } from '../../theme';
import { Empty, ErrorNote, Loading, ScreenTitle } from '../../components/ui';
import { useSession } from '../../lib/session';
import { gql, Org, Project, ProjectDevices, Q } from '../../lib/api';
import { demoDevices } from '../../lib/demo-devices';
import ModeSwitch from '../../components/ModeSwitch';

type ListDevice = {
  _id: string;
  name: string;
  devEui?: string;
  hardwareId?: string;
  timestamp?: string;
  cluster?: string;
  status?: string;
  secondaryStatus?: string;
  lastHeard?: string;
  color?: string;
  isDemo: boolean;
};

export default function Devices() {
  const {
    user,
    org,
    selectOrg,
    selectedProject,
    selectProject,
  } = useSession();

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clusters, setClusters] = useState<ProjectDevices['clusters']>([]);

  const [demo, setDemo] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load organizations
  useEffect(() => {
    let alive = true;

    async function loadOrgs() {
      if (!user) return;

      try {
        const data = await gql<{ accounts: Org[] }>(
          Q.orgs,
          {},
          user.token
        );

        if (!alive) return;

        const list = (data.accounts || []).filter(
          item => item.isActive && item.isAccepted
        );

        setOrgs(list);

        if (!org && list.length > 0) {
          const defaultOrg =
            list.find(
              item => item.organisationId === user.organisationId
            ) || list[0];

          selectOrg(defaultOrg);
        }
      } catch (e: unknown) {
        if (alive) {
          setError(
            e instanceof Error ? e.message : 'Unable to load organizations'
          );
        }
      }
    }

    loadOrgs();

    return () => {
      alive = false;
    };
  }, [user?.token, user?.organisationId, refreshKey]);

  // Load projects for the selected organization
  useEffect(() => {
    let alive = true;

    setProjects([]);
    setClusters([]);

    if (!org || !user) {
      setLoading(false);
      return;
    }

    async function loadProjects() {
      setLoading(true);
      setError('');

      try {
        const data = await gql<{ projectOverview: Project[] }>(
          Q.projects,
          {
            params: {
              organisationId: org!.organisationId,
            },
          },
          user!.token
        );

        if (!alive) return;

        const list = data.projectOverview || [];

        setProjects(list);

        // Keep the current project if it belongs to this organization.
        // Otherwise, select the first available project.
        if (
          !selectedProject ||
          !list.some(item => item._id === selectedProject._id)
        ) {
          selectProject(list[0] || null);
        }
      } catch (e: unknown) {
        if (alive) {
          setError(
            e instanceof Error ? e.message : 'Unable to load projects'
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      alive = false;
    };
  }, [org?.organisationId, user?.token, refreshKey]);

  // Load devices for the selected project
  useEffect(() => {
    let alive = true;

    setClusters([]);

    if (!org || !selectedProject || !user) {
      setLoading(false);
      return;
    }

    async function loadDevices() {
      setLoading(true);
      setError('');

      try {
        const data = await gql<{ projects: ProjectDevices[] }>(
          Q.devices,
          {
            params: {
              organisationId: org!.organisationId,
              projectId: selectedProject!._id,
            },
          },
          user!.token
        );

        if (!alive) return;

        setClusters(
          data.projects?.flatMap(project => project.clusters || []) || []
        );
      } catch (e: unknown) {
        if (alive) {
          setError(
            e instanceof Error ? e.message : 'Unable to load devices'
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadDevices();

    return () => {
      alive = false;
    };
  }, [
    org?.organisationId,
    selectedProject?._id,
    user?.token,
    refreshKey,
  ]);

  // Convert API devices into the list format used by the UI
  const liveDevices: ListDevice[] = useMemo(
    () =>
      clusters.flatMap(cluster =>
        (cluster.devices || []).map(device => ({
          ...device,
          cluster: cluster.name,
          isDemo: false,
        }))
      ),
    [clusters]
  );

  // Switch between real and demo devices
  const devices: ListDevice[] = useMemo(
    () =>
      demo
        ? demoDevices.map(device => ({
            ...device,
            isDemo: true,
          }))
        : liveDevices,
    [demo, liveDevices]
  );

  // Search and status filtering
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        device.name.toLowerCase().includes(query) ||
        (device.devEui || '').toLowerCase().includes(query) ||
        (device.hardwareId || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' ||
        device.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [devices, search, statusFilter]);

  const filterOptions = [
    'All',
    'Ready',
    'ON',
    'Moderate',
    'Empty',
    'SOS',
    'Poor',
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => setRefreshKey(key => key + 1)}
          tintColor={C.green}
        />
      }
    >
      <ScreenTitle
        title="Devices"
        subtitle="Your connected devices, all in one place"
      />

      <ModeSwitch demo={demo} onChange={setDemo} />

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={21} color={C.muted} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search devices"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        <Pressable
          onPress={() => setShowFilters(value => !value)}
          accessibilityRole="button"
          accessibilityLabel="Toggle device filters"
        >
          <Ionicons
            name="options-outline"
            size={23}
            color={showFilters ? C.greenDark : C.muted}
          />
        </Pressable>
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
        >
          {filterOptions.map(option => (
            <Pressable
              key={option}
              onPress={() => setStatusFilter(option)}
              style={[
                styles.filterPill,
                statusFilter === option && styles.selected,
              ]}
            >
              <Text style={styles.filterText}>{option}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Organization selector */}
      <Text style={styles.label}>ORGANIZATION</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selector}
      >
        {orgs.map(item => (
          <Pressable
            key={item.organisationId}
            onPress={() => selectOrg(item)}
            style={[
              styles.pill,
              org?.organisationId === item.organisationId &&
                styles.selected,
            ]}
          >
            <Text style={styles.pillText}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Project selector */}
      <Text style={styles.label}>PROJECT</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selector}
      >
        {projects.map(item => (
          <Pressable
            key={item._id}
            onPress={() => selectProject(item)}
            style={[
              styles.pill,
              selectedProject?._id === item._id && styles.selected,
            ]}
          >
            <Text style={styles.pillText}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Current project */}
      <View style={styles.projectHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CURRENT PROJECT</Text>
          <Text style={styles.projectName}>
            {demo
              ? 'Demo Devices'
              : selectedProject?.name || 'No project selected'}
          </Text>
        </View>

        <Text style={styles.deviceCount}>
          {filteredDevices.length} devices
        </Text>
      </View>

      {/* Demo mode notice */}
      {demo ? (
        <View style={styles.demoNote}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={C.greenDark}
          />
          <Text style={styles.demoNoteText}>
            Demo Mode — sample devices, not connected to hardware.
          </Text>
        </View>
      ) : null}

      {!demo && error ? <ErrorNote message={error} /> : null}

      {/* Device states */}
      {!demo && loading ? (
        <Loading />
      ) : !demo && !org ? (
        <Empty
          icon="business-outline"
          title="No organizations"
          description="No active organization is available."
        />
      ) : !demo && !projects.length ? (
        <Empty
          icon="folder-open-outline"
          title="No projects yet"
          description="Create a project in Ginjer, then refresh."
        />
      ) : !demo && !selectedProject ? (
        <Empty
          icon="folder-open-outline"
          title="Select a project"
          description="Choose a project to view its devices."
        />
      ) : filteredDevices.length === 0 ? (
        <Empty
          icon="hardware-chip-outline"
          title={
            search || statusFilter !== 'All'
              ? 'No matching devices'
              : 'No devices connected'
          }
          description={
            search || statusFilter !== 'All'
              ? 'Try a different search or filter.'
              : 'Add a device in Ginjer, then refresh.'
          }
        />
      ) : (
        <View style={styles.deviceList}>
          {filteredDevices.map(device => (
            <Pressable
              key={device._id}
              style={styles.deviceCard}
              onPress={() => {
                if (device.isDemo) {
                  router.push({
                    pathname: '/device/[id]',
                    params: {
                      id: device._id,
                      demo: 'true',
                    },
                  });
                } else if (selectedProject && org) {
                  router.push({
                    pathname: '/device/[id]',
                    params: {
                      id: device._id,
                      projectId: selectedProject._id,
                      organisationId: org.organisationId,
                    },
                  });
                }
              }}
            >
              <View style={styles.deviceIcon}>
                <Ionicons
                  name={
                    device.name.toLowerCase().includes('light')
                      ? 'bulb-outline'
                      : 'hardware-chip-outline'
                  }
                  size={25}
                  color={C.greenDark}
                />
              </View>

              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>

                <Text style={styles.deviceMeta}>
                  {device.devEui ||
                    device.hardwareId ||
                    device.cluster ||
                    'Device'}
                </Text>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: device.color || C.green },
                    ]}
                  />

                  <Text style={styles.statusText}>
                    {device.status || 'Registered'}
                  </Text>

                  {device.secondaryStatus && (
                    <Text style={styles.statusText}>
                      · {device.secondaryStatus}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.rightSide}>
                <Text style={styles.lastHeard}>
                  {device.lastHeard || device.timestamp || '—'}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={C.greenDark}
                />
              </View>
            </Pressable>
          ))}
        </View>
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
    padding: 20,
    paddingTop: 54,
    paddingBottom: 50,
  },
  searchBar: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.ink,
  },
  filters: {
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 9,
  },
  selector: {
    marginBottom: 19,
  },
  pill: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 9,
  },
  selected: {
    backgroundColor: C.greenPale,
    borderColor: C.green,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.greenDark,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 20,
    gap: 10,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },
  deviceCount: {
    fontSize: 12,
    fontWeight: '700',
    color: C.greenDark,
  },
  demoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.greenPale,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  demoNoteText: {
    color: C.greenDark,
    fontSize: 12,
    flex: 1,
  },
  deviceList: {
    gap: 11,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  deviceIcon: {
    width: 49,
    height: 49,
    backgroundColor: C.greenPale,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: C.ink,
    fontWeight: '800',
    fontSize: 14,
  },
  deviceMeta: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },
  statusDot: {
    height: 7,
    width: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: C.muted,
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  lastHeard: {
    fontSize: 10,
    color: C.muted,
    maxWidth: 78,
    textAlign: 'right',
  },
});