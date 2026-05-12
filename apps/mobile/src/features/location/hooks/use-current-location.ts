import { useCallback, useState, useRef, useEffect } from 'react';
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
  const isLocatingRef = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const locate =
    useCallback(async (): Promise<CurrentLocationResult | null> => {
      if (isLocatingRef.current) {
        return null;
      }

      isLocatingRef.current = true;
      setIsLocating(true);
      setError(null);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted.current) {
            setError('Location permission denied.');
          }
          return null;
        }

        const positionPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000),
        );

        const position = (await Promise.race([
          positionPromise,
          timeoutPromise,
        ])) as Location.LocationObject;

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
      } catch (err: any) {
        if (isMounted.current) {
          setError(
            err.message === 'timeout'
              ? 'Location request timed out.'
              : 'Unable to get current location.',
          );
        }
        return null;
      } finally {
        isLocatingRef.current = false;
        if (isMounted.current) {
          setIsLocating(false);
        }
      }
    }, []);

  const clearError = useCallback(() => {
    if (isMounted.current) {
      setError(null);
    }
  }, []);

  return { isLocating, error, locate, clearError };
}
