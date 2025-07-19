import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'OFFICE' | 'DISTRICT_SUPERVISOR';
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthEnabled: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAuthEnabled: import.meta.env.VITE_AUTHENTICATION_ENABLED === 'true'
  });

  const checkAuth = async () => {
    // If authentication is disabled, set as authenticated with mock user
    if (!state.isAuthEnabled) {
      setState(prev => ({
        ...prev,
        user: { id: 1, username: 'dev-user', role: 'ADMIN', isActive: true },
        isAuthenticated: true,
        isLoading: false
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setState(prev => ({
          ...prev,
          user: userData.user,
          isAuthenticated: true,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setState(prev => ({
          ...prev,
          user: data.user,
          isAuthenticated: true
        }));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = async () => {
    if (!state.isAuthEnabled) {
      return;
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false
      }));
    }
  };

  useEffect(() => {
    checkAuth();
  }, [state.isAuthEnabled]);

  // Set up token expiry check
  useEffect(() => {
    if (!state.isAuthenticated || !state.isAuthEnabled) return;

    const interval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.isAuthEnabled]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};