import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    console.log('🔄 SocketProvider: Checking auth...');
    console.log('Token exists?', !!token);
    console.log('User exists?', !!user);

    if (!token || !user) {
      console.log('❌ No token or user, skipping socket connection');
      return;
    }

    console.log('🔌 Connecting to socket...');

    // Try connecting with more robust options
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected successfully!', newSocket.id);
      console.log('📤 Emitting authenticate for user:', user.id);
      newSocket.emit('authenticate', user.id);
    });

    newSocket.on('authenticated', () => {
      console.log('✅ User authenticated on server');
    });

    // 🔔 New notification
    newSocket.on('new_notification', (data) => {
      console.log('🔔 Received new notification:', data);
      toast.custom((t) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-green-500">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{data.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{data.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(data.time).toLocaleTimeString()}</p>
              {data.link && (
                <a href={data.link} className="text-xs text-indigo-600 hover:underline mt-1 block">
                  View Details →
                </a>
              )}
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    });

    // 📋 Ticket updated
    newSocket.on('ticket_updated', (data) => {
      console.log('📋 Received ticket update:', data);
      toast.custom((t) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{data.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{data.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(data.time).toLocaleTimeString()}</p>
              {data.link && (
                <a href={data.link} className="text-xs text-indigo-600 hover:underline mt-1 block">
                  View Ticket →
                </a>
              )}
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    });

    // 📌 Ticket assigned
    newSocket.on('ticket_assigned', (data) => {
      console.log('📌 Received ticket assignment:', data);
      toast.custom((t) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-orange-500">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📌</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{data.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{data.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(data.time).toLocaleTimeString()}</p>
              {data.link && (
                <a href={data.link} className="text-xs text-indigo-600 hover:underline mt-1 block">
                  View Ticket →
                </a>
              )}
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    return () => {
      console.log('🔌 Cleaning up socket');
      if (newSocket) {
        newSocket.disconnect();
        newSocket.close();
      }
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};