import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { OrderStats } from '../components/order-stats';
import { OrderCard, type OrderProps } from '../components/order-card';

const MOCK_ORDERS: Omit<OrderProps, 'onActionPress'>[] = [
  {
    id: '#ORD-92140',
    date: 'Oct 26, 2026',
    status: 'Processing',
    totalItems: 5,
    totalPrice: 42.30,
    actionText: 'Track Order',
    items: [
      { id: '1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBELZ5Eb-Tlvg7UC3aSSLWtPSp1AJvLvnnN0U8npdtjPZb4pW3VxuLGWvtg6fHeqwoYYv-D3wEMrEKjW8NSgoL29eewRglOJlzgurUYawqSv9f-1ZTfYuPkt-1DBR1WpPNeUCht5G5XACE7NeqiJIdUiPhVYdKs9qiHiZ0pG5phULlYEEl6_glRqCSphzaH-6u6mhkZqg5JOKN9n3X6NKRPD0Skejlj3ze5D-qLAdRwTY4guBuoGrRYMH7HWy1y0E-rux5rQNPz_ouy' },
      { id: '2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1kwXwpwjUHXeFwcX65ffGMFqKzJCaaijvjYUXZUwjwzzKL7-bZKpC9_N2Q5llkNy3s4Kx4d_AUto59TmsxJz-OBaTQYK7uGJ4u9xaCWaJzxn3Djv_jREobp8XepGDRiSn-3oM3dF07vpyzaStTQ4r2L-oUudPlBFPdwdYYCLva-wgl2_eG8MxgtWIk_zMfcUE-VRqE1UefQ0V8AzIehXHBJ0YuJ8K5uMIssm6KXun_tbSLPQYcViBQqVjzhtkSCen_9Oou04Cu-wH' },
      { id: '3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBow1PwDhusPylLQZ4hJsukRc3aaMtY_7AIsMWs2fl9dpdIJUxW0OiBGZ8VT7mSqJCuH5Fh-4WAnYzC3w9hQA9lBNKTY2Qn31_kN68fD5nd_NVhKAT8PGM0hbp93IEzSDttJ8NgmKXqfVFqaA_H80CS4NL-KwGi69ASPoUMpHmHuLWBmLph9ZDFmW4Le3yy8OQpzDkCKTxlIkZw3RcjuS_LyvWCYtWBmqP6REPtQ1PpJz_oppmkLeBBpMXh56ECdSzTtSHYs43c6Ewf' },
    ]
  },
  {
    id: '#ORD-82731',
    date: 'Oct 24, 2026',
    status: 'Delivered',
    totalItems: 3,
    totalPrice: 30.85,
    actionText: 'Reorder',
    items: [
      { id: '4', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDW9ErJDM8Oq9RwLqpTwA_ysiITABJLIFcZt5NGa6jWPxgXqh8FZlN84RTYDEJ5I_p4e3EfJRY_aXmPCZ2JboeluFu4Bsc7ciPXBuaWiWDmSh4CjP9ILP6oYmdVIRCNCg70NIl6P1x11bkr-rUSZZYlPpMPs9q4YOpjr2LNhHfeQjaL92LmH1DNsXYwtLWYVKdxQUL5sko8a-5wNw80yuZvfAd5OlNDy7ePkJo5BbeCDlbbV79LYOqSPK37E1XrlBsFtr-G2MHCgsB' },
      { id: '5', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxYvRHNayeprSBAgMvY6c-8MZJD7WT6u_r3Flj_pA8E-aPco1Kh6xCP8NKKYRs12yijeZJ_6ALmSsNtYOr58OM6RxA6GxsnvFrOtjs03yD9EJS8QqgyznrS2ADJZZEx2gFOufEsHK3MPbql3A3Oo02JyurhRgieYApWqjyIG6UMtkF3Zh9vPAfr19NWy1kClpYrn8rrvPNdwjkhXWlFXS1-IbbjLe2cEXvG_s90Qana46FjT7rXj-7vsXqU8grTas6sWm3dLuWx18V' },
      { id: '6', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcPDPQQu4OxdOMJ2jRF_nzqllskzCnX7PmyKN9vqPjHew-KhBYVcTNTAzNlZ0QwtCQ2nzFb3z8zSf5G8Hy6VzTIG31DgBYvyjUleuBNkFshU97-4q0YnVLGIIgYb1MLSPo7oK1N8f6cRyw74F-pgSO-LIxEeDNMJN46SAu2WYqhPHiLLdtPrfzeq79cOZT-osXaJTVqASK9HPMz2taCpjp9jumfC9iODBUylV2-BTOpBoH7lwDxVU7QSw5G_vaiIa_dNGWUefPkGME' },
    ]
  },
  {
    id: '#ORD-75612',
    date: 'Oct 18, 2026',
    status: 'Delivered',
    totalItems: 7,
    totalPrice: 68.20,
    actionText: 'Reorder',
    items: [
      { id: '7', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2E2mZz1ykv05HI_mmN6ylCVYXQN3D7jgSA3JttwTMTJmWOty0fonCQMdZc7VXHdxQMEmANj77pjBEiDl1MpXcsMiYEfXGPUCQ6YgtyetFNiA66_2HfetwZbgmT_4j5mGz6SHCwuUvIUv2GCv_BbI-JYiALFF9VIJvz7RUCQ7dmTWid7W5V5NLwByhw_8oZ1B1MY8-Inz6kEie7w8vvdfvtFA0EDaEBaxpU2JT7g6Ts2c1-PIklPvtt1k62JlFsVX3vqRp3yY0cYrZ' },
      { id: '8', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkJq6o7cxeR4oqPefbSPqbwYaZu31r5MA-ELV0PoI_jFLrBlj-W6X9R1OznCEtfJmgDbs03VaTk-hLvyiJfYHTptnlRw__zgmiGSiJfIczaOU7GiHti7ssyPDLZVOIt3kp8A-ZAmQpW6kXW2m7srH1213kAJ-KAMSw00FnfJ4ebnWhU8yfofdGEEq8ffsLe3Q1JWQBFtAW4bwjVrY0nPR_QNoU_GhklzhVoVYI3GhwqW7qRNWAJ3zd7p-dn7twNlmBT5ELrBFo2znU' },
      { id: '9', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBafKyrBHtbv4LPAL-eYuHidgXrw-A2o5O-XpiduIrlIcvmj1eKNyrynBtfqssy8cjJer2l920Do1Ryki4nVW5wAKHg-y0gVvUoiThGX5-YfqTrnu3PrVp_QEWjAtGmrhezZgUBSLFrpYVJFir03FuxWrRm4F6ffSICv49EynH56vZWxbatzau65lcBlN70-HEJ-d3Xf8jbERHz8N9X8OXTKTt8hWS2_7b1YoZ3YKQNT5yedmot8hpMTp69P4EjTAXel5IfdBzMyM2s' },
    ]
  }
];

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between px-4 h-16 w-full bg-surface/80 z-50">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} color="#0d631b" />
        </TouchableOpacity>
        <Text className="text-lg text-primary" style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
          Order History
        </Text>
        <TouchableOpacity 
          className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-transform"
        >
          <Filter size={24} color="#0d631b" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <OrderStats />
        
        <View className="space-y-6">
          {MOCK_ORDERS.map((order) => (
            <OrderCard 
              key={order.id}
              {...order}
              onActionPress={() => {
                // handle action
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
