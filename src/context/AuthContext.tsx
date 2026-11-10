import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { currentUser } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleProfiles: Record<UserRole, User> = {
  participant: {
    ...currentUser,
    role: 'participant',
    name: 'Dian Paramitha',
    title: 'Participant',
    studentId: '84920',
  },
  instructor: {
    id: 'john-smith',
    name: 'John Smith',
    email: 'john.smith@eduspace.ac.id',
    role: 'instructor',
    avatarId: 'john-smith',
    title: 'Lead Instructor',
    bio: 'Senior Staff Engineer and Lead Instructor for Web Development Cohort 2025.',
  },
  admin: {
    id: 'admin-portal-1',
    name: 'Super Admin',
    email: 'admin@eduspace.ac.id',
    role: 'admin',
    avatarId: 'usr-84920',
    title: 'Admin Portal',
  },
};

const isUserRole = (value: string | null): value is UserRole =>
  value === 'participant' || value === 'instructor' || value === 'admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('eduspace_role');
    return isUserRole(saved) ? saved : 'participant';
  });

  const [user, setUser] = useState<User | null>(() => {
    return roleProfiles[role];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('eduspace_authenticated') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('eduspace_role', role);
    setUser(roleProfiles[role]);
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setUser(roleProfiles[newRole]);
  };

  const login = (chosenRole?: UserRole) => {
    const targetRole = chosenRole || role;
    setRole(targetRole);
    setIsAuthenticated(true);
    localStorage.setItem('eduspace_authenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('eduspace_authenticated', 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
        setRole,
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
