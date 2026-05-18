import { create } from 'zustand';
import { NotificationPayload } from '../features/notification/types';

interface NotificationState {
  unreadCount: number;
  items: NotificationPayload[];
  isLoaded: boolean;
  pushToken: string | null;
  
  // Actions
  setUnreadCount: (count: number) => void;
  setItems: (items: NotificationPayload[]) => void;
  addNotification: (notification: NotificationPayload) => void;
  markReadInStore: (id: string) => void;
  markAllReadInStore: () => void;
  setLoaded: (loaded: boolean) => void;
  setPushToken: (token: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  items: [],
  isLoaded: false,
  pushToken: null,

  setUnreadCount: (count) => set({ unreadCount: count }),
  
  setItems: (items) => set({ items }),
  
  setPushToken: (token) => set({ pushToken: token }),

  addNotification: (notification) =>
    set((state) => {
      // Avoid duplicates if WS and Push arrive at the same time
      const exists = state.items.some((item) => item.id === notification.id);
      if (exists) return state;

      return {
        items: [notification, ...state.items],
        unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
      };
    }),

  markReadInStore: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllReadInStore: () =>
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt || new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  setLoaded: (loaded) => set({ isLoaded: loaded }),
}));
