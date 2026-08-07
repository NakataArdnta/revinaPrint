import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';

interface AuthContextType {
  user: UserAccount | null;
  activeRoleView: 'CUSTOMER' | 'ADMIN';
  login: (account: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, whatsapp?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRoleView: (view: 'CUSTOMER' | 'ADMIN') => void;
  updateProfile: (data: Partial<UserAccount>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('revina_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const isAdminUser = (u: UserAccount | null) =>
    !!u && (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' || u.role === 'OPERATOR');

  const [activeRoleView, setActiveRoleView] = useState<'CUSTOMER' | 'ADMIN'>(() => {
    const savedRole = localStorage.getItem('revina_role_view');
    const savedUserStr = localStorage.getItem('revina_user');
    if (savedRole === 'ADMIN' && savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (isAdminUser(u)) return 'ADMIN';
      } catch (e) {}
    }
    return 'CUSTOMER';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('revina_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('revina_user');
    }
  }, [user]);

<<<<<<< HEAD
  const login = async (account: string, password?: string, role: UserRole = 'CUSTOMER'): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, email: account, whatsapp: account, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal masuk. Periksa kembali kredensial Anda.' };
      }
      setUser(data.user);
      if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'ADMIN' || data.user.role === 'OPERATOR') {
        setActiveRoleView('ADMIN');
        localStorage.setItem('revina_role_view', 'ADMIN');
      } else {
        setActiveRoleView('CUSTOMER');
        localStorage.setItem('revina_role_view', 'CUSTOMER');
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Terjadi kesalahan koneksi ke server.' };
=======
  const login = async (
  identifier: string,
  password?: string,
  role: UserRole = "CUSTOMER"
): Promise<boolean> => {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputAccount: identifier.trim(),
        password: password?.trim(),
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return false;
>>>>>>> 37f196d423c8981e7ed414b52223486be6df54e4
    }

    setUser(data.user);

    if (
      ["SUPER_ADMIN", "ADMIN", "OPERATOR"].includes(data.user.role)
    ) {
      setActiveRoleView("ADMIN");
      localStorage.setItem("revina_role_view", "ADMIN");
    } else {
      setActiveRoleView("CUSTOMER");
      localStorage.setItem("revina_role_view", "CUSTOMER");
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

  const register = async (name: string, email: string, password: string, whatsapp?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Gagal melakukan pendaftaran.' };
      }
      setUser(data.user);
      setActiveRoleView('CUSTOMER');
      localStorage.setItem('revina_role_view', 'CUSTOMER');
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Terjadi kesalahan koneksi ke server.' };
    }
  };

  const logout = () => {
    setUser(null);
    setActiveRoleView('CUSTOMER');
    localStorage.removeItem('revina_user');
    localStorage.setItem('revina_role_view', 'CUSTOMER');
  };

  const switchRoleView = (view: 'CUSTOMER' | 'ADMIN') => {
    if (view === 'ADMIN' && !isAdminUser(user)) {
      setActiveRoleView('CUSTOMER');
      localStorage.setItem('revina_role_view', 'CUSTOMER');
      return;
    }
    setActiveRoleView(view);
    localStorage.setItem('revina_role_view', view);
  };

  const updateProfile = (data: Partial<UserAccount>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRoleView,
        login,
        register,
        logout,
        switchRoleView,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
