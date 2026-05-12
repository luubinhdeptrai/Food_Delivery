import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import type { Coordinates } from '../types';

interface CurrentLocationResult {
  label: string;
  coords: Coordinates;
}

const buildLocationLabel = (
  place?: Location.LocationGeocodedAddress | null,
) => {
  if (!place) {
    return 'Current Location';
  }

  const parts = [
    place.name,
    place.street,
    place.city,
    place.region,
    place.postalCode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Current Location';
};

export function useCurrentLocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate =
    useCallback(async (): Promise<CurrentLocationResult | null> => {
      if (isLocating) {
        return null;
      }

      setIsLocating(true);
      setError(null);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied.');
          return null;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = position.coords;

        let label = 'Current Location';
        try {
          const [place] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          label = buildLocationLabel(place);
        } catch {
          // Reverse geocoding can fail; keep the fallback label.
        }

        return { label, coords: { latitude, longitude } };
      } catch {
        setError('Unable to get current location.');
        return null;
      } finally {
        setIsLocating(false);
      }
    }, [isLocating]);

  const clearError = useCallback(() => setError(null), []);

  return { isLocating, error, locate, clearError };
}
