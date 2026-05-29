import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock3,
  LocateFixed,
  Map,
  MapPin,
  MoreVertical,
  Search,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAddressSearch, useCurrentLocation } from '../hooks';
import { useAddressStore } from '../store/address-store';

type LocationTab = 'recent' | 'saved';

type LocationListItem = {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  coords?: { latitude: number; longitude: number } | null;
};

interface LocationRowProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClassName?: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

const DEFAULT_RECENT_LOCATIONS: LocationListItem[] = [
  {
    id: 'bcons-plaza',
    title: 'Bcons Plaza Apartment',
    subtitle: '0.08km - Thong Nhat, Dong Hoa Ward',
    address: 'Bcons Plaza Apartment, Thong Nhat, Dong Hoa Ward',
  },
  {
    id: 'mien-dong-station',
    title: 'Mien Dong New Coach Station',
    subtitle: '2.98km - Xa Lo Ha Noi, Long Binh',
    address: 'Mien Dong New Coach Station, Xa Lo Ha Noi, Long Binh',
  },
  {
    id: 'national-university',
    title: 'National University Station',
    subtitle: '3.14km - Song Hanh Xa Lo Ha Noi',
    address: 'National University Station, Song Hanh Xa Lo Ha Noi',
  },
  {
    id: 'm-one-south-saigon',
    title: 'M-One South Saigon',
    subtitle: '18km - Huynh Tan Phat, District 7',
    address: 'M-One South Saigon, Huynh Tan Phat, District 7',
  },
];

function LocationRow({
  title,
  subtitle,
  icon,
  iconClassName = 'bg-surface-container',
  onPress,
  disabled,
  testID,
}: LocationRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-start gap-4 rounded-3xl bg-surface-container-lowest p-4 active:bg-surface-container-low"
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
    >
      <View
        className={`h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        {icon}
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className="font-jakarta-sans text-base font-semibold text-on-surface"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="mt-0.5 text-sm text-on-surface-variant"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      <View className="p-1">
        <MoreVertical size={20} color="#40493d" />
      </View>
    </TouchableOpacity>
  );
}

export function AddressSelectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);
  const [activeTab, setActiveTab] = useState<LocationTab>('recent');
  const {
    setSelectedAddress,
    latitude,
    longitude,
    savedAddresses,
    recentSearches,
  } = useAddressStore();
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    isSearching,
    error: searchError,
    shouldSearch,
    clearError: clearSearchError,
  } = useAddressSearch({ latitude, longitude });
  const {
    isLocating,
    error: locationError,
    locate: locateCurrentLocation,
    clearError: clearLocationError,
  } = useCurrentLocation();

  const handleSelectAddress = (
    address: string,
    coords?: { latitude: number; longitude: number } | null,
  ) => {
    setSelectedAddress(address, coords);
    clearLocationError();
    clearSearchError();
    router.back();
  };

  const handleUseCurrentLocation = async () => {
    const result = await locateCurrentLocation();
    if (!result) {
      return;
    }

    setSelectedAddress(result.label, result.coords);
    router.back();
  };

  const handleChooseOnMap = () => {
    Alert.alert('Choose on Map', 'Map picker feature coming soon!');
  };

  const recentLocations: LocationListItem[] =
    recentSearches.length > 0
      ? recentSearches.map((search) => ({
          id: search.id,
          title: search.address,
          subtitle: 'Recent search',
          address: search.address,
          coords: search.coords,
        }))
      : DEFAULT_RECENT_LOCATIONS;

  return (
    <View className="flex-1 bg-surface">
      <View
        className="z-10 bg-surface px-4 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-low"
            accessibilityRole="button"
            accessibilityLabel="Back"
            testID="back-button"
          >
            <ArrowLeft size={24} color="#40493d" />
          </TouchableOpacity>
          <Text className="font-jakarta-sans text-lg font-bold text-on-surface">
            Select Location
          </Text>
          <TouchableOpacity
            onPress={() => searchInputRef.current?.focus()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-low"
            accessibilityRole="button"
            accessibilityLabel="Focus search"
          >
            <Search size={22} color="#40493d" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="z-10 bg-surface px-4 pb-4 pt-2">
        <View className="relative justify-center">
          <View className="pointer-events-none absolute left-4 z-10">
            <MapPin size={21} color="#00490e" fill="#00490e" />
          </View>
          <TextInput
            ref={searchInputRef}
            className="h-14 w-full rounded-full border-2 border-primary-fixed bg-surface-container-lowest px-12 text-sm font-medium text-on-surface"
            placeholder="Search for area, street name..."
            placeholderTextColor="#40493d"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      <View className="z-10 border-b border-surface-container-high bg-surface px-4 pb-2">
        <View className="flex-row gap-2">
          {(['recent', 'saved'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 ${
                  isActive ? 'bg-primary-fixed' : 'bg-transparent'
                }`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  className={`font-jakarta-sans text-sm ${
                    isActive
                      ? 'font-semibold text-on-primary-fixed-variant'
                      : 'font-medium text-on-surface-variant'
                  }`}
                >
                  {tab === 'recent' ? 'Recent' : 'Saved'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 24) + 120,
          gap: 8,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <LocationRow
          title={isLocating ? 'Fetching your location' : 'Current location'}
          subtitle={
            isLocating
              ? 'This may take a moment'
              : 'Using GPS for exact location...'
          }
          icon={
            isLocating ? (
              <ActivityIndicator size="small" color="#00490e" />
            ) : (
              <LocateFixed size={22} color="#00490e" />
            )
          }
          iconClassName="bg-primary-fixed/20"
          onPress={handleUseCurrentLocation}
          disabled={isLocating}
          testID="use-current-location"
        />

        {locationError ? (
          <Text className="px-4 py-1 text-xs text-error" selectable>
            {locationError}
          </Text>
        ) : null}

        <View className="mx-4 my-2 h-px bg-surface-container-high" />

        {shouldSearch ? (
          <View className="gap-2">
            {isSearching ? (
              <View className="flex-row items-center gap-2 px-4 py-3">
                <ActivityIndicator size="small" color="#00490e" />
                <Text className="text-sm text-on-surface-variant">
                  Searching addresses...
                </Text>
              </View>
            ) : null}
            {searchError ? (
              <Text className="px-4 text-xs text-error" selectable>
                {searchError}
              </Text>
            ) : null}
            {!isSearching && !searchError && searchResults.length === 0 ? (
              <Text className="px-4 py-3 text-sm text-on-surface-variant">
                No matches found.
              </Text>
            ) : null}
            {searchResults.map((result) => (
              <LocationRow
                key={result.id}
                title={result.label}
                subtitle={result.subtitle || 'Search result'}
                icon={<MapPin size={21} color="#40493d" />}
                onPress={() =>
                  handleSelectAddress(result.label, {
                    latitude: result.latitude,
                    longitude: result.longitude,
                  })
                }
              />
            ))}
          </View>
        ) : activeTab === 'recent' ? (
          <View className="gap-2">
            {recentLocations.map((location) => (
              <LocationRow
                key={location.id}
                title={location.title}
                subtitle={location.subtitle}
                icon={<Clock3 size={21} color="#40493d" fill="#40493d" />}
                onPress={() =>
                  handleSelectAddress(location.address, location.coords ?? null)
                }
              />
            ))}
          </View>
        ) : (
          <View className="gap-2">
            {savedAddresses.length > 0 ? (
              savedAddresses.map((address) => (
                <LocationRow
                  key={address.id}
                  title={address.label}
                  subtitle={address.address}
                  icon={<MapPin size={21} color="#40493d" />}
                  onPress={() =>
                    handleSelectAddress(address.address, address.coords)
                  }
                />
              ))
            ) : (
              <Text className="px-4 py-3 text-sm text-on-surface-variant">
                No saved addresses yet.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <LinearGradient
        colors={['rgba(249,249,249,0)', '#f9f9f9']}
        pointerEvents="none"
        className="absolute bottom-0 left-0 right-0 h-32"
      />

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center px-6"
        style={{ bottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity
          onPress={handleChooseOnMap}
          className="flex-row items-center gap-2 rounded-full border border-surface-container bg-surface-container-lowest px-6 py-3.5 active:bg-surface-container-low"
          style={{
            boxShadow: '0 8px 32px rgba(26, 28, 28, 0.12)',
          }}
          accessibilityRole="button"
          accessibilityLabel="Choose on Map"
        >
          <Map size={21} color="#1a1c1c" />
          <Text className="font-jakarta-sans text-sm font-bold text-on-surface">
            Choose on Map
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
