import React, {createContext, useContext, useEffect, useState} from 'react';
import {api} from '../api/instance';
import {useRouter} from '@tanstack/react-router';

interface AuthContextType {
    user: string | null;
    setUser: React.Dispatch<React.SetStateAction<string | null>>;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                const response = await api.get('/members/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data || 'User');
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);


    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        window.location.href = "/"
    };

    useEffect(() => {
        if (user) {
            /*
            showNotification({
                title: '로그인',
                message: `${user}님 땅먹 ㄱㄱ`,
                color: 'green',
                loading: true,
                autoClose: 1500,
            });
            */
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{user, setUser, loading, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
