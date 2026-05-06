import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, ShoppingCart, ReceiptText, User, Receipt } from 'lucide-react-native';

interface BottomNavProps {
  insetBottom: number;
  activeTab?: 'home' | 'cart' | 'orders' | 'profile';
  transparent?: boolean;
}

export function BottomNav({ insetBottom, activeTab = 'home', transparent = false }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: "Home" },
    { id: 'cart', icon: ShoppingCart, label: "Cart" },
    { id: 'orders', icon: ReceiptText, label: "Orders" },
    { id: 'profile', icon: User, label: "Profile" },
  ];

  return (
    <View
      className={`absolute bottom-0 left-0 right-0 flex-row justify-around items-center rounded-t-3xl ${transparent ? 'bg-white/90 backdrop-blur-lg shadow-lg border-t border-surface-variant/30' : 'bg-surface-container-lowest'}`}
      style={{
        paddingBottom: Math.max(insetBottom, transparent ? 24 : insetBottom + 8),
        paddingTop: 12,
        ...(!transparent && {
          shadowColor: "#1a1c1c",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 24,
          elevation: 12,
          borderTopWidth: 1,
          borderTopColor: "rgba(191,202,186,0.2)",
        })
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        if (transparent) {
          // HomeScreen style
          if (isActive) {
            return (
              <TouchableOpacity key={tab.id} className="flex-col items-center justify-center bg-primary-fixed/30 rounded-2xl px-5 py-2 active:scale-90">
                <Icon size={24} color="#0d631b" />
                <Text className="font-inter text-[11px] font-semibold tracking-wide uppercase text-primary mt-1">{tab.label}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={tab.id} className="flex-col items-center justify-center px-5 py-2 active:scale-90 opacity-70">
              <Icon size={24} color="#707a6c" />
              <Text className="font-inter text-[11px] font-semibold tracking-wide uppercase text-outline mt-1">{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        // ProductDetailScreen style
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.75}
            className={`items-center justify-center px-5 py-2 rounded-2xl ${isActive ? "bg-primary-fixed" : ""}`}
          >
            <Icon
              size={24}
              color={isActive ? "#0d631b" : "#707a6c"}
              fill={isActive ? "#0d631b" : "none"}
            />
            <Text
              className={`text-[10px] mt-0.5 ${isActive ? "text-primary" : "text-outline"}`}
              style={{ fontFamily: "Inter_600SemiBold" }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
