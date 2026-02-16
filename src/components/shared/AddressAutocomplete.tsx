'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function AddressAutocomplete({ value, onChange, placeholder, icon }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=TH&accept-language=th`,
        { headers: { 'User-Agent': 'ERideHub/1.0' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (result: NominatimResult) => {
    onChange(result.display_name, parseFloat(result.lat), parseFloat(result.lon));
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          {icon}
        </div>
      )}
      <input
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder || 'พิมพ์ที่อยู่...'}
        className={`w-full rounded-xl border border-gray-200 py-2.5 text-sm outline-none focus:border-orange-400 ${icon ? 'pl-9 pr-4' : 'px-3'}`}
        autoComplete="off"
      />
      {searching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
        </div>
      )}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="cursor-pointer px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 border-b border-gray-50 last:border-0 leading-relaxed"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
