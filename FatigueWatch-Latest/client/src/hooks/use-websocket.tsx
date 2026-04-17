import { useEffect, useState, useRef } from "react";

interface WebSocketMessage {
  type: string;
  data: any;
}

interface WebSocketHook {
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
}

export function useWebSocket(): WebSocketHook {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket(wsUrl);
        
        ws.current.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
        };

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setLastMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.current.onclose = () => {
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            setConnectionStatus('connecting');
            connectWebSocket();
          }, 3000);
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setConnectionStatus('disconnected');
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return {
    connectionStatus,
    lastMessage,
    sendMessage
  };
}
