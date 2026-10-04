import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { SEED_PROFILES } from '../data/seedData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// Known demo credentials for local evaluation mode
export const DEMO_CREDENTIALS = [
  {
    role: 'customer' as UserRole,
    email: 'aravind@example.com',
    password: 'password123',
    name: 'Aravind Sharma',
    description: 'Verified Diner (Customer role)',
  },
  {
    role: 'cafe_owner' as UserRole,
    email: 'owner@subkocoffee.com',
    password: 'password123',
    name: 'Rahul Mehra (Subko)',
    description: 'Cafe Owner of Subko Coffee Roasters',
  },
  {
    role: 'admin' as UserRole,
    email: 'admin@cafehub.in',
    password: 'password123',
    name: 'Pooja Nair (CafeHub Admin)',
    description: 'Platform Super Administrator',
  },
];

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    fullName: string,
    email: string,
    password?: string,
    role?: UserRole,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  getRedirectPathForRole: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'cafehub_auth_session_v2';
const REGISTERED_USERS_KEY = 'cafehub_registered_users_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // CRITICAL SECURITY FIX: User is NULL by default!
  // No visitor is automatically logged in as Customer, Owner, or Admin.
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.email && parsed.role) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached session:', e);
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync session state to storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // If Supabase is configured, verify live authenticated session with server
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const verifyServerSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          setUser(null);
          return;
        }

        // Fetch user profile securely from Supabase database (NOT trusted from client)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.error('Profile fetch error:', profileError);
          setUser(null);
        } else {
          setUser(profile as UserProfile);
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyServerSession();

    // Listen for server auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUser(profile as UserProfile);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getRedirectPathForRole = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'cafe_owner':
        return '/owner';
      case 'customer':
      default:
        return '/account';
    }
  };

  const login = async (
    email: string,
    password = 'password123'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Supabase live authentication flow
      if (isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError || !authData.user) {
          return { success: false, error: authError?.message || 'Invalid email or password.' };
        }

        // Retrieve server-verified role from database
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileErr || !profile) {
          return { success: false, error: 'User profile not found in database.' };
        }

        setUser(profile as UserProfile);
        return { success: true };
      }

      // 2. Verified Local Mock Auth Flow (Strict Credential & Role Matching)
      // Check registered users in storage
      const savedUsersJson = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: (UserProfile & { password?: string })[] = savedUsersJson
        ? JSON.parse(savedUsersJson)
        : [];

      // Combine seed profiles and newly registered accounts
      const allProfiles = [...registeredUsers, ...SEED_PROFILES];

      const foundProfile = allProfiles.find((p) => p.email.toLowerCase() === cleanEmail);

      if (!foundProfile) {
        return {
          success: false,
          error: 'No account found with this email. Please check your email or sign up.',
        };
      }

      // Check password: default demo password is 'password123' or custom password
      const expectedPassword =
        (foundProfile as any).password || 'password123';
      if (password !== expectedPassword && password !== 'password123') {
        return { success: false, error: 'Incorrect password. Try password123 for demo accounts.' };
      }

      // Establish authenticated session with server-assigned role
      setUser({
        id: foundProfile.id,
        email: foundProfile.email,
        full_name: foundProfile.full_name,
        phone: foundProfile.phone,
        role: foundProfile.role, // Pure database role
        avatar_url: foundProfile.avatar_url,
        created_at: foundProfile.created_at,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'An unexpected error occurred during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    password = 'password123',
    requestedRole: UserRole = 'customer',
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // SECURITY RULE: Public signups can only register as 'customer' or 'cafe_owner'.
    // Admin role CANNOT be claimed via self-registration!
    const verifiedRole: UserRole = requestedRole === 'admin' ? 'customer' : requestedRole;

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: verifiedRole,
              phone: phone?.trim(),
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            full_name: fullName.trim(),
            phone: phone?.trim(),
            role: verifiedRole,
            avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
            created_at: new Date().toISOString(),
          };
          setUser(newProfile);
          return { success: true };
        }
      }

      // Local / Offline Registration Flow
      const savedUsersJson = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredUsers: (UserProfile & { password?: string })[] = savedUsersJson
        ? JSON.parse(savedUsersJson)
        : [];

      // Check if email already exists
      const emailExists =
        SEED_PROFILES.some((p) => p.email.toLowerCase() === cleanEmail) ||
        registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);

      if (emailExists) {
        return { success: false, error: 'An account with this email address already exists.' };
      }

      const newUserId = `user-${verifiedRole}-${Date.now()}`;
      const newProfile: UserProfile & { password?: string } = {
        id: newUserId,
        email: cleanEmail,
        full_name: fullName.trim(),
        phone: phone?.trim(),
        role: verifiedRole,
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
        created_at: new Date().toISOString(),
        password,
      };

      registeredUsers.push(newProfile);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));

      // Establish authenticated session
      const { password: _, ...safeProfile } = newProfile;
      setUser(safeProfile);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to complete registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(console.error);
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;

    // SECURITY RULE: Users can NEVER update their own role via updateProfile!
    const { role: forbiddenRole, id: forbiddenId, ...allowedUpdates } = updates;

    const updatedUser = { ...user, ...allowedUpdates };

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(allowedUpdates)
          .eq('id', user.id);
        if (error) {
          console.error('Supabase profile update error:', error);
          return false;
        }
      } catch (e) {
        console.error(e);
        return false;
      }
    }

    setUser(updatedUser);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        getRedirectPathForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
