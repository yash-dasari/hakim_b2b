interface WebSocketMessage {
  type: string;
  event_type?: string;
  data?: any;
}

interface NotificationOptions {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export class AdminWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private onEventCallbacks: Map<string, Array<(data: any) => void>> = new Map();
  private onNotificationCallback: ((options: NotificationOptions) => void) | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;
  private wsUrl: string;

  constructor(token: string) {
    this.token = token;
      // Allow WebSocket URL to be configured via environment variable
      // Default to api-dev.hakimauto.com if not specified
      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api-dev.hakimauto.com';
    this.wsUrl = `${wsBaseUrl}/ops-tracking/v1/ws/admin/dashboard?token=${encodeURIComponent(token)}`;
  }


  async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      console.log('Attempting WebSocket connection to:', this.wsUrl.replace(/token=[^&]+/, 'token=***'));
      this.ws = new WebSocket(this.wsUrl);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          if (this.ws) {
            this.ws.close();
          }
          const errorMessage = 'WebSocket connection timeout. Please refresh the page to reconnect.';
          this.onStatusChange?.('error', errorMessage);
          // Don't auto-reconnect - only retry on page refresh or manual retry
        }
      }, 10000); // 10 second timeout

      this.ws.onopen = () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        console.log('✅ Admin WebSocket connected');
        this.reconnectAttempts = 0;
        this.onStatusChange?.('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          console.log('📨 WebSocket message received:', message);
          
          // Respond to ping
          if (message.type === 'ping') {
            this.ws?.send(JSON.stringify({ type: 'pong' }));
            return;
          }

          // Show notification for any message received (except ping)
          if (message.type !== 'ping' && this.onNotificationCallback) {
            const notificationMessage = message.event_type 
              ? `Event: ${message.event_type}` 
              : `Message: ${message.type}`;
            
            this.onNotificationCallback({
              message: notificationMessage,
              type: 'info',
              duration: 5000
            });
          }

          // Trigger message callback for API refresh
          if (this.onMessageCallback) {
            this.onMessageCallback(message);
          }

          // Handle events
          if (message.type === 'event' && message.event_type) {
            this.handleEvent(message.event_type, message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket URL:', this.wsUrl);
        console.error('WebSocket readyState:', this.ws?.readyState);
        // Log more details if available
        if (this.ws) {
          console.error('WebSocket state details:', {
            url: this.ws.url,
            readyState: this.ws.readyState,
            protocol: this.ws.protocol,
            extensions: this.ws.extensions
          });
        }
        const errorMessage = 'Failed to connect to WebSocket server. Please check your connection.';
        this.onStatusChange?.('error', errorMessage);
      };

      this.ws.onclose = (event) => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        console.log('WebSocket disconnected:', event.code, event.reason);
        console.log('Close event details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: this.wsUrl
        });
        
        // Handle different close codes
        let errorMessage: string | undefined;
        
        if (event.code === 1008) {
          // Policy violation - usually auth failure
          errorMessage = 'Access denied: Admin privileges required. Please log in again.';
          this.onStatusChange?.('error', errorMessage);
          return;
        } else if (event.code === 1006) {
          // Abnormal closure - connection lost (no close frame received)
          // This typically means:
          // 1. Server is not running or unreachable
          // 2. SSL/TLS handshake failed
          // 3. Network/firewall blocking the connection
          // 4. Wrong endpoint URL
          console.error('❌ WebSocket Error 1006: Abnormal Closure');
          console.error('Possible causes:');
          console.error('1. Server at api-dev.hakimauto.com may be down or unreachable');
          console.error('2. SSL/TLS certificate issue - check if the server certificate is valid');
          console.error('3. Network/firewall blocking WebSocket connections');
          console.error('4. WebSocket endpoint may not exist or be misconfigured');
          console.error('5. CORS or security policy blocking the connection');
          console.error('');
          console.error('Troubleshooting steps:');
          console.error('- Verify the server is running: https://api-dev.hakimauto.com');
          console.error('- Check if the WebSocket endpoint exists: wss://api-dev.hakimauto.com/ops-tracking/v1/ws/admin/dashboard');
          console.error('- Verify your token is valid and not expired');
          console.error('- Check browser console for SSL/TLS errors');
          console.error('- Test with a WebSocket client tool (e.g., wscat, Postman)');
          errorMessage = 'Cannot connect to WebSocket server. The server may be unreachable, the endpoint may not exist, or there may be network/firewall issues. Please verify the server is running and accessible.';
          this.onStatusChange?.('error', errorMessage);
        } else if (event.code === 1000) {
          // Normal closure
          this.onStatusChange?.('disconnected');
          return;
        } else if (event.code === 1002) {
          // Protocol error
          errorMessage = 'WebSocket protocol error. Please check server configuration.';
          this.onStatusChange?.('error', errorMessage);
        } else if (event.code === 1003) {
          // Unsupported data
          errorMessage = 'WebSocket received unsupported data format.';
          this.onStatusChange?.('error', errorMessage);
        } else if (event.code === 1011) {
          // Internal server error
          errorMessage = 'WebSocket server encountered an error. Please try again later.';
          this.onStatusChange?.('error', errorMessage);
        } else if (event.code === 1015) {
          // TLS handshake failure
          errorMessage = 'WebSocket TLS handshake failed. SSL certificate may be invalid.';
          this.onStatusChange?.('error', errorMessage);
        } else {
          errorMessage = `WebSocket connection closed (Code: ${event.code}${event.reason ? `: ${event.reason}` : ''}). Please refresh the page to reconnect.`;
          this.onStatusChange?.('error', errorMessage);
        }

        // Don't auto-reconnect - only retry on page refresh or manual retry
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create WebSocket connection. Please refresh the page to retry.';
      this.onStatusChange?.('error', errorMessage);
      // Don't auto-reconnect - only retry on page refresh or manual retry
    }
  }

  private handleEvent(eventType: string, data: any) {
    console.log(`📢 WebSocket Event: ${eventType}`, data);

    // Call registered callbacks for this event type
    const callbacks = this.onEventCallbacks.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }

    // Show notification based on event type
    this.showNotificationForEvent(eventType, data);
  }

  private showNotificationForEvent(eventType: string, data: any) {
    let notification: NotificationOptions | null = null;

    switch (eventType) {
      case 'booking.created':
        notification = {
          message: `📋 New booking: ${data.reference_id || data.booking_id}`,
          type: 'info'
        };
        break;
      case 'dispatch.created':
        notification = {
          message: `🚗 Driver assigned to ${data.reference_id || data.booking_id}`,
          type: 'success'
        };
        break;
      case 'dispatch.accepted':
        notification = {
          message: `✅ Driver accepted ${data.reference_id || data.booking_id}`,
          type: 'success'
        };
        break;
      case 'dispatch.rejected':
        notification = {
          message: `❌ Driver rejected ${data.reference_id || data.booking_id}`,
          type: 'warning'
        };
        break;
      case 'service.started':
        notification = {
          message: `🚀 Service started: ${data.reference_id || data.booking_id}`,
          type: 'info'
        };
        break;
      case 'service.completed':
        notification = {
          message: `✅ Service completed: ${data.reference_id || data.booking_id}`,
          type: 'success'
        };
        break;
      case 'booking.updated':
        notification = {
          message: `📝 Booking updated: ${data.reference_id || data.booking_id}`,
          type: 'info'
        };
        break;
      case 'booking.cancelled':
        notification = {
          message: `🚫 Booking cancelled: ${data.reference_id || data.booking_id}`,
          type: 'warning'
        };
        break;
    }

    if (notification && this.onNotificationCallback) {
      this.onNotificationCallback(notification);
    }
  }

  on(eventType: string, callback: (data: any) => void) {
    if (!this.onEventCallbacks.has(eventType)) {
      this.onEventCallbacks.set(eventType, []);
    }
    this.onEventCallbacks.get(eventType)?.push(callback);
  }

  off(eventType: string, callback: (data: any) => void) {
    const callbacks = this.onEventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  onNotification(callback: (options: NotificationOptions) => void) {
    this.onNotificationCallback = callback;
  }

  onMessage(callback: (message: any) => void) {
    this.onMessageCallback = callback;
  }

  onStatusChange?: (status: 'connected' | 'disconnected' | 'error', errorMessage?: string) => void;

  // Manual reconnect method (called only on user action or page refresh)
  reconnect() {
    // Reset reconnect attempts for manual retry
    this.reconnectAttempts = 0;
    
    // Disconnect existing connection if any
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clear any existing timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Attempt new connection
    this.connect();
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.onEventCallbacks.clear();
    this.onNotificationCallback = null;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

