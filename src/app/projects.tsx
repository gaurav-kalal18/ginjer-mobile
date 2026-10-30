
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C } from '../theme';
import { gql, Q, Project } from '../lib/api';
import { useSession } from '../lib/session';

export default function ProjectsScreen() {
  const {
    user,
    org,
    project,
    selectProject,
  } = useSession();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;

    setProjects([]);
    setError('');

    if (!user || !org) {
      return;
    }

    async function loadProjects() {
      setLoading(true);

      try {
        const data = await gql<{
          projectOverview: Project[];
        }>(
          Q.projects,
          {
            params: {
              organisationId: org!.organisationId,
            },
          },
          user!.token
        );

        if (alive) {
          setProjects(data.projectOverview || []);
        }
      } catch (e: any) {
        if (alive) {
          setError(e.message || 'Unable to load projects.');
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
  }, [user?.token, org?.organisationId, refreshKey]);

  const chooseProject = (item: Project) => {
    selectProject(item);
    router.replace('/(tabs)/devices');
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => setRefreshKey(x => x + 1)}
          tintColor={C.green}
        />
      }
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={C.ink}
          />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.subtitle}>
            Select a project to manage its devices
          </Text>
        </View>
      </View>

      <View style={styles.organization}>
        <Ionicons
          name="business-outline"
          size={22}
          color={C.greenDark}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.smallLabel}>
            CURRENT ORGANIZATION
          </Text>
          <Text style={styles.orgName}>
            {org?.name || 'No organization selected'}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Your Projects
        </Text>

        <Text style={styles.count}>
          {projects.length} projects
        </Text>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color={C.green}
          style={{ marginTop: 35 }}
        />
      )}

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      {!loading && !org && (
        <View style={styles.empty}>
          <Ionicons
            name="business-outline"
            size={40}
            color={C.green}
          />
          <Text style={styles.emptyTitle}>
            No organization selected
          </Text>
          <Text style={styles.emptyDescription}>
            Select an organization from the Devices screen.
          </Text>
        </View>
      )}

      {!loading && !!org && projects.length === 0 && (
        <View style={styles.empty}>
          <Ionicons
            name="folder-open-outline"
            size={44}
            color={C.green}
          />
          <Text style={styles.emptyTitle}>
            No projects found
          </Text>
          <Text style={styles.emptyDescription}>
            Create a project in Ginjer and refresh this screen.
          </Text>
        </View>
      )}

      {!loading &&
        projects.map(item => {
          const selected = project?._id === item._id;

          return (
            <Pressable
              key={item._id}
              style={[
                styles.projectCard,
                selected && styles.selectedCard,
              ]}
              onPress={() => chooseProject(item)}
            >
              <View style={styles.projectTop}>
                <View style={styles.projectAvatar}>
                  <Text style={styles.avatarLetter}>
                    {item.name?.charAt(0).toUpperCase() || 'P'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.projectName}>
                    {item.name}
                  </Text>

                  {selected && (
                    <Text style={styles.selectedLabel}>
                      Currently selected
                    </Text>
                  )}
                </View>

                <Ionicons
                  name={
                    selected
                      ? 'checkmark-circle'
                      : 'chevron-forward'
                  }
                  size={23}
                  color={C.greenDark}
                />
              </View>

              <View style={styles.projectBottom}>
                <View style={styles.projectBadge}>
                  <Ionicons
                    name="hardware-chip-outline"
                    size={15}
                    color={C.greenDark}
                  />
                  <Text style={styles.badgeText}>
                    View Devices
                  </Text>
                </View>

                <Text style={styles.openText}>
                  Open Project
                </Text>
              </View>
            </Pressable>
          );
        })}

      <View style={styles.note}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={C.greenDark}
        />
        <Text style={styles.noteText}>
          Projects are loaded from your Ginjer organization.
          Device data will load when you select a project.
        </Text>
      </View>
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
    maxWidth: 480,
    alignSelf: 'center',
    padding: 20,
    paddingTop: 45,
    paddingBottom: 55,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: C.ink,
  },
  subtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },
  organization: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.greenPale,
    borderRadius: 14,
    padding: 16,
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 0.7,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '800',
    color: C.ink,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.ink,
  },
  count: {
    fontSize: 12,
    fontWeight: '700',
    color: C.greenDark,
  },
  projectCard: {
    backgroundColor: C.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.line,
    padding: 18,
    gap: 22,
  },
  selectedCard: {
    borderColor: C.green,
  },
  projectTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  projectAvatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#F0F1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 25,
    color: C.muted,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '800',
    color: C.ink,
  },
  selectedLabel: {
    fontSize: 11,
    color: C.greenDark,
    marginTop: 5,
  },
  projectBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: C.greenPale,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    color: C.greenDark,
    fontWeight: '700',
  },
  openText: {
    fontSize: 12,
    color: C.greenDark,
    fontWeight: '800',
  },
  error: {
    color: '#D83A3A',
    fontSize: 13,
    lineHeight: 20,
  },
  empty: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 17,
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.ink,
  },
  emptyDescription: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  note: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: C.greenPale,
    padding: 14,
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: C.greenDark,
  },
});
