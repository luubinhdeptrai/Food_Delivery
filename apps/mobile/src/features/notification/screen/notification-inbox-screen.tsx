import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useNotificationInbox } from '../hooks/use-notification-inbox';
import { useNotificationStore } from '@/src/store/notification-store';
import { NotificationItem } from '../components/notification-item';
import { NotificationPayload } from '../types';
import { notificationApi } from '../api';

export function NotificationInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, markReadInStore, markAllReadInStore } = useNotificationStore();
  const { isLoading, refetch } = useNotificationInbox();

  const handleNotificationPress = async (notification: NotificationPayload) => {
    // 1. Optimistic update
    if (!notification.isRead) {
      markReadInStore(notification.id);
      try {
        await notificationApi.markAsRead(notification.id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    // 2. Navigate based on type (Basic for now)
    if (notification.orderId) {
      // In a real app, navigate to order details
      router.push('/(customer)/(tabs)/orders');
    }
  };

  const handleMarkAllAsRead = async () => {
    markAllReadInStore();
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 h-16 border-b border-surface-variant">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <ArrowLeft size={24} color="#0d631b" />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-primary">Notifications</Text>
        
        <TouchableOpacity 
          onPress={handleMarkAllAsRead}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <CheckCheck size={20} color="#0d631b" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0d631b" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem 
              notification={item} 
              onPress={handleNotificationPress} 
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-10">
              <Text className="text-primary/50 text-center">
                Chưa có thông báo nào. Đặt hàng ngay để nhận cập nhật!
              </Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        />
      )}
    </View>
  );
}
