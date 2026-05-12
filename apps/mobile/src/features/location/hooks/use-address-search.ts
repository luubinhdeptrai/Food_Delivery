import { useEffect, useState } from 'react';
import { searchPhoton, type PhotonSearchResult } from '../api/photon';

interface UseAddressSearchOptions {
  latitude?: number | null;
  longitude?: number | null;
  limit?: number;
  lang?: string;
  minQueryLength?: number;
  debounceMs?: number;
}

interface UseAddressSearchResult {
  query: string;
  setQuery: (value: string) => void;
  results: PhotonSearchResult[];
  isSearching: boolean;
  error: string | null;
  shouldSearch: boolean;
  clearError: () => void;
}

export function useAddressSearch(
  options: UseAddressSearchOptions = {},
): UseAddressSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PhotonSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    latitude,
    longitude,
    limit = 6,
    lang = 'en',
    minQueryLength = 3,
    debounceMs = 350,
  } = options;

  const trimmedQuery = query.trim();
  const shouldSearch = trimmedQuery.length >= minQueryLength;

  useEffect(() => {
    if (!shouldSearch) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const response = await searchPhoton(trimmedQuery, {
          limit,
          lang,
          lat: latitude ?? undefined,
          lon: longitude ?? undefined,
          signal: controller.signal,
        });
        setResults(response);
      } catch {
        if (!controller.signal.aborted) {
          setError('Unable to fetch address suggestions.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [
    trimmedQuery,
    shouldSearch,
    latitude,
    longitude,
    limit,
    lang,
    debounceMs,
  ]);

  const clearError = () => setError(null);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    shouldSearch,
    clearError,
  };
}
