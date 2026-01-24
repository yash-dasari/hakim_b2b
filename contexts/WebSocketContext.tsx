import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useCompanyWebSocket } from '../hooks/useCompanyWebSocket';

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: any | null;
    sendMessage: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { company, accessToken } = useSelector((state: RootState) => state.auth);
    const [lastMessage, setLastMessage] = useState<any | null>(null);

    const { isConnected, sendMessage } = useCompanyWebSocket({
        companyId: company?.id,
        token: accessToken,
        onMessage: (msg) => {
            setLastMessage(msg);
        },
        autoConnect: true
    });

    return (
        <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};
