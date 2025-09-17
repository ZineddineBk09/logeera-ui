"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from 'js-cookie';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextValue>({ 
  socket: null, 
  isConnected: false, 
  connectionError: null 
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    
    if (!token) {
      console.log("No access token available for socket connection");
      setConnectionError("No authentication token");
      return;
    }

    // Enable Socket.IO connection with fallback to REST API
    console.log("Attempting Socket.IO connection...");
    
    const url = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";
    const s = io(url, { 
      path: "/api/socketio", 
      transports: ["websocket", "polling"],
      auth: {
        token: token
      },
      timeout: 5000, // 5 second timeout
      forceNew: true
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    s.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
      setConnectionError("Real-time chat temporarily unavailable - Messages will be saved but not delivered in real-time");
    });

    setSocket(s);
    
    return () => {
      s.close();
    };
  }, []);

  const value = useMemo(() => ({ socket, isConnected, connectionError }), [socket, isConnected, connectionError]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}


