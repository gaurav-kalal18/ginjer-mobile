import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { gql, Q, Org, Project } from './api';

const KEY = 'ginjer-session-v1';

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  emailId: string;
  token: string;
  organisationId?: string;
};

type Session = {
  user: User | null;
  org: Org | null;
  selectedProject: Project | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  selectOrg: (org: Org) => void;
  selectProject: (project: Project | null) => void;
};

const Ctx = createContext<Session | null>(null);

async function save(user: User | null) {
  if (Platform.OS !== 'web') {
    if (user) {
      await SecureStore.setItemAsync(KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  }
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          const storedUser = await SecureStore.getItemAsync(KEY);

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch {
        // Ignore invalid or unavailable stored session data.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const value = useMemo<Session>(
    () => ({
      user,
      org,
      selectedProject,
      ready,

      async signIn(email, password) {
        const data = await gql<{ signIn: User }>(
          Q.signIn,
          {
            auth: {
              emailId: email.trim(),
              password,
              application: 'Ginjer',
              forever: true,
            },
          }
        );

        if (!data.signIn?.token) {
          throw new Error('Sign in did not return a token');
        }

        await save(data.signIn);

        setUser(data.signIn);
        setOrg(null);
        setSelectedProject(null);
      },

      async signOut() {
        setUser(null);
        setOrg(null);
        setSelectedProject(null);
        await save(null);
      },

      selectOrg(nextOrg) {
        setOrg(currentOrg => {
          if (
            currentOrg?.organisationId !== nextOrg.organisationId
          ) {
            setSelectedProject(null);
          }

          return nextOrg;
        });
      },

      selectProject(project) {
        setSelectedProject(project);
      },
    }),
    [user, org, selectedProject, ready]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const session = useContext(Ctx);

  if (!session) {
    throw new Error('Missing SessionProvider');
  }

  return session;
}