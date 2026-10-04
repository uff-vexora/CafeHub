import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { SEED_PROFILES } from '../data/seedData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (fullName: string, email: string, role: UserRole, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cafehub_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default to customer for immediate demo richness
    return SEED_PROFILES[0];
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cafehub_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cafehub_auth_user');
    }
  }, [user]);

  // Hook into Supabase auth session if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile as UserProfile);
          }
        }
      } catch (err) {
        console.error('Supabase session load error:', err);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // If Supabase is active, authenticate with it
      if (isSupabaseConfigured) {
        // Attempt Supabase sign in
      }

      // Find or construct profile
      const found = SEED_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setUser(found);
      } else {
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          role: requestedRole || 'customer',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
          created_at: new Date().toISOString(),
        };
        setUser(newUser);
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    role: UserRole,
    phone?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        phone,
        role,
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(console.error);
    }
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const switchDemoRole = (role: UserRole) => {
    const demoProfile = SEED_PROFILES.find((p) => p.role === role) || {
      id: `user-${role}-demo`,
      email: `${role}@cafehub.demo`,
      full_name: role === 'customer' ? 'Customer Demo' : role === 'cafe_owner' ? 'Subko Cafe Owner' : 'Super Admin',
      role,
      created_at: new Date().toISOString(),
    };
    setUser(demoProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        switchDemoRole,
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
