import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, LogOut } from 'lucide-react-native';
import { useSession } from '@/src/lib/auth-client';
import { authApi } from '@/src/features/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      router.replace('/(auth)');
    } catch (err) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
      console.error(err);
    }
  };

  return (
    <View
      className="flex-1 bg-surface px-6"
      style={{ paddingTop: insets.top + 20 }}
    >
      <View className="items-center mb-10">
        <View className="w-24 h-24 rounded-full bg-primary-fixed items-center justify-center mb-4">
          <User size={48} color="#0d631b" />
        </View>
        <Text
          className="text-on-surface text-2xl font-bold"
          style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
        >
          {session?.user.name || 'User'}
        </Text>
        <Text
          className="text-on-surface-variant text-base"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {session?.user.email || ''}
        </Text>
      </View>

      <View className="gap-y-4">
        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center bg-error-container p-4 rounded-2xl"
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#410002" />
          <Text
            className="text-on-error-container ml-3 font-bold"
            style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
