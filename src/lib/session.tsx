
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
  project: Project | null;
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

async function loadDefaultOrg(user: User): Promise<Org | null> {
  const data = await gql<{ accounts: Org[] }>(
    Q.orgs,
    {},
    user.token
  );

  const accounts = data.accounts || [];

  if (accounts.length === 0) {
    return null;
  }

  // Prefer the organization used by the signed-in account.
  const preferred = accounts.find(
    (account) =>
      account.organisationId === user.organisationId
  );

  // Otherwise prefer Infinite State for the hackathon.
  const infiniteState = accounts.find(
    (account) =>
      account.name.trim().toLowerCase() === 'infinite state'
  );

  // Fall back to the first accepted, active organization.
  const available = accounts.find(
    (account) => account.isActive && account.isAccepted
  );

  return preferred || infiniteState || available || accounts[0];
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        if (Platform.OS !== 'web') {
          const stored = await SecureStore.getItemAsync(KEY);

          if (stored) {
            const savedUser = JSON.parse(stored) as User;

            if (mounted) {
              setUser(savedUser);
            }

            try {
              const defaultOrg = await loadDefaultOrg(savedUser);

              if (mounted) {
                setOrg(defaultOrg);
              }
            } catch (error) {
              console.warn(
                'Could not restore Ginjer organization:',
                error
              );
            }
          }
        }
      } catch (error) {
        console.warn('Could not restore Ginjer session:', error);
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<Session>(
    () => ({
      user,
      org,
      project,
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

        const signedInUser = data.signIn;

        if (!signedInUser?.token) {
          throw new Error('Sign in did not return a token');
        }

        // Load the organization using the new user's token.
        const defaultOrg = await loadDefaultOrg(signedInUser);

        await save(signedInUser);

        setUser(signedInUser);
        setOrg(defaultOrg);
        setProject(null);
      },

      async signOut() {
        setUser(null);
        setOrg(null);
        setProject(null);

        await save(null);
      },

      selectOrg(nextOrg) {
        if (
          org?.organisationId !== nextOrg.organisationId
        ) {
          setProject(null);
        }

        setOrg(nextOrg);
      },

      selectProject: setProject,
    }),
    [user, org, project, ready]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const session = useContext(Ctx);

  if (!session) {
    throw new Error('Missing SessionProvider');
  }

  return session;
}
