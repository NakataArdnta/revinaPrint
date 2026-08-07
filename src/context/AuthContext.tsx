import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdminAuthenticated: boolean;
  activeRoleView: 'CUSTOMER' | 'ADMIN';
  verifyAdminPassword: (password: string) => boolean;
  logoutAdmin: () => void;
  switchRoleView: (view: 'CUSTOMER' | 'ADMIN') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('revina_admin_auth') === 'true';
  });

  const [activeRoleView, setActiveRoleView] = useState<'CUSTOMER' | 'ADMIN'>(() => {
    const saved = localStorage.getItem('revina_role_view');
    const isAuth = localStorage.getItem('revina_admin_auth') === 'true';
    if (saved === 'ADMIN' && isAuth) return 'ADMIN';
    return 'CUSTOMER';
  });

  useEffect(() => {
    if (isAdminAuthenticated) {
      localStorage.setItem('revina_admin_auth', 'true');
    } else {
      localStorage.removeItem('revina_admin_auth');
    }
  }, [isAdminAuthenticated]);

  const verifyAdminPassword = (password: string): boolean => {
    if (password === 'revinanakata') {
      setIsAdminAuthenticated(true);
      setActiveRoleView('ADMIN');
      localStorage.setItem('revina_admin_auth', 'true');
      localStorage.setItem('revina_role_view', 'ADMIN');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setActiveRoleView('CUSTOMER');
    localStorage.removeItem('revina_admin_auth');
    localStorage.setItem('revina_role_view', 'CUSTOMER');
  };

  const switchRoleView = (view: 'CUSTOMER' | 'ADMIN') => {
    if (view === 'ADMIN' && !isAdminAuthenticated) {
      setActiveRoleView('CUSTOMER');
      localStorage.setItem('revina_role_view', 'CUSTOMER');
      return;
    }
    setActiveRoleView(view);
    localStorage.setItem('revina_role_view', view);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminAuthenticated,
        activeRoleView,
        verifyAdminPassword,
        logoutAdmin,
        switchRoleView,
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
