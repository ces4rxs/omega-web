import { io } from 'socket.io-client';

// WebSocket URL - uses environment variable or defaults to Render production
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://backtester-pro-1.onrender.com';

export const socket = io(WS_URL, {
    transports: ['websocket'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000, // Cap max delay
    randomizationFactor: 0.5,   // Jitter to prevent thundering herd
    autoConnect: false,         // Manual connection only
});
