import React, {createContext, useContext, useEffect, useState} from 'react';
import {api} from '../api/instance';
import {MemberSummary} from "../types/MemberSummary.tsx";

interface AuthContextType {
    member: MemberSummary | null;
    setMember: React.Dispatch<React.SetStateAction<MemberSummary | null>>;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [member, setMember] = useState<MemberSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setMember(null);
                    setLoading(false);
                    return;
                }

                const response = await api.get('/members/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setMember(response.data || 'User');
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setMember(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);


    const logout = () => {
        localStorage.removeItem('accessToken');
        setMember(null);
        window.location.href = "/"
    };

    return (
        <AuthContext.Provider value={{member: member, setMember: setMember, loading, logout}}>
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
