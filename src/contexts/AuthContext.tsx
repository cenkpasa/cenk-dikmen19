import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { initialUsers } from '@/services/data.service';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUserPhoto: (userId: string, photoDataUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);
      const storedUsers = localStorage.getItem('users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : initialUsers;
      if (!storedUsers) {
        localStorage.setItem('users', JSON.stringify(initialUsers));
      }
      setUsers(allUsers);

      const sessionUserJson = localStorage.getItem('currentUser');
      if (sessionUserJson) {
        try {
          const sessionUser = JSON.parse(sessionUserJson);
          const fullUser = allUsers.find((u: User) => u.id === sessionUser.id);
          setCurrentUser(fullUser || null);
        } catch (e) {
          console.error("Failed to parse user from storage", e);
          localStorage.removeItem('currentUser');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    // Read the definitive source of users directly from storage to prevent any state-related race conditions.
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      console.error("User database not found in localStorage during login attempt.");
      return false;
    }
    
    const allUsers: User[] = JSON.parse(storedUsers);
    const user = allUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      // If found, strip the password for session storage but keep it in the main state.
      const { password: _password, ...userToStore } = user;
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      
      // Update the React state to trigger re-render
      setCurrentUser(user);
      
      // Ensure the in-memory state is also up-to-date.
      setUsers(allUsers); 
      
      return true;
    }
    
    return false;
  }, []);

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updateUserPhoto = useCallback((userId: string, photoDataUrl: string) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user.id === userId ? { ...user, photo: photoDataUrl } : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      if (currentUser?.id === userId) {
        const updatedCurrentUser = { ...currentUser, photo: photoDataUrl };
        const { password: _password, ...userToStore } = updatedCurrentUser;
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
      }
      return updatedUsers;
    });
  }, [currentUser]);

  const value = { currentUser, users, isLoading, login, logout, updateUserPhoto };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};