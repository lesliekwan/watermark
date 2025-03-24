import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userId = JSON.parse(token);
            const user = await db.users.get(userId);
            if (user) {
              const { password, ...userWithoutPassword } = user;
              setUser(userWithoutPassword);
            } else {
              localStorage.removeItem('token');
            }
          } catch (error) {
            console.error('Invalid token:', error);
            localStorage.removeItem('token');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 