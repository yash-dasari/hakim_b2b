import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketMessage {
    type?: string;
    data?: any;
    event_type?: string;
    [key: string]: any;
}

interface UseCompanyWebSocketOptions {
    companyId?: string | null;
    token?: string | null;
    onMessage?: (message: WebSocketMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    autoConnect?: boolean;
}

export const useCompanyWebSocket = ({
    companyId,
    token,
    onMessage,
    onOpen,
    onClose,
    onError,
    autoConnect = true
}: UseCompanyWebSocketOptions) => {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Keep track of latest callbacks to avoid re-connecting on callback change
    const callbacksRef = useRef({ onMessage, onOpen, onClose, onError });

    useEffect(() => {
        callbacksRef.current = { onMessage, onOpen, onClose, onError };
    }, [onMessage, onOpen, onClose, onError]);

    const connect = useCallback(() => {
        if (!companyId || !token) return;

        // Prevent multiple connections
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        const wsUrl = `wss://api-dev.hakimauto.com/ops-tracking/v1/ws/company/${companyId}?token=${token}`;
        console.log('🔌 Connecting to WebSocket:', wsUrl);

        try {
            const socket = new WebSocket(wsUrl);
            wsRef.current = socket;

            socket.onopen = () => {
                if (!isMountedRef.current) {
                    socket.close();
                    return;
                }
                console.log('✅ WebSocket Connected');
                setIsConnected(true);
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
                callbacksRef.current.onOpen?.();
            };

            socket.onmessage = (event) => {
                if (!isMountedRef.current) return;
                try {
                    const data = JSON.parse(event.data);
                    callbacksRef.current.onMessage?.(data);
                } catch (error) {
                    console.error('Error parsing WS message:', error);
                    // Still pass raw data if needed or just log
                }
            };

            socket.onerror = (error) => {
                if (!isMountedRef.current) return;
                console.error('❌ WebSocket Error:', error);
                callbacksRef.current.onError?.(error);
            };

            socket.onclose = (event) => {
                if (!isMountedRef.current) return;
                console.log('⚠️ WebSocket Disconnected');
                setIsConnected(false);
                wsRef.current = null;
                callbacksRef.current.onClose?.();

                // Reconnect logic
                if (event.code !== 1000) { // 1000 is normal closure
                    console.log('🔄 Attempting to reconnect in 3s...');
                    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current && (companyId && token)) {
                            connect();
                        }
                    }, 3000);
                }
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            // Retry on setup failure
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && (companyId && token)) {
                    connect();
                }
            }, 5000);
        }
    }, [companyId, token]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close(1000, 'Component unmounted or manual disconnect');
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((data: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn('⚠️ Cannot send message: WebSocket is not open');
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        if (autoConnect && companyId && token) {
            connect();
        }
        return () => {
            isMountedRef.current = false;
            disconnect();
        };
    }, [connect, disconnect, autoConnect, companyId, token]);

    return { isConnected, sendMessage, connect, disconnect };
};
