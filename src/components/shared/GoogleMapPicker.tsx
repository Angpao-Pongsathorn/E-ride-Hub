'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface NominatimAddress {
  road?: string;
  footway?: string;
  path?: string;
  hamlet?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  subdistrict?: string;
  town?: string;
  city?: string;
  city_district?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface GoogleMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  jumpTo?: { lat: number; lng: number } | null; // เลื่อนหมุดจาก outside
  onLocationSelect: (lat: number, lng: number, address: string, district?: string, province?: string) => void;
}

interface GeocodeResult {
  address: string;
  district: string;
  province: string;
}

// Default: คำเขื่อนแก้ว, ยโสธร
const DEFAULT_CENTER = { lat: 15.6617, lng: 104.1403 };

// SVG map-pin icon — tip at bottom-center, iconAnchor = [14, 40]
const PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
  <filter id="ps" x="-30%" y="-20%" width="160%" height="160%">
    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000044"/>
  </filter>
  <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="#F97316" filter="url(#ps)"/>
  <circle cx="14" cy="14" r="6" fill="white"/>
</svg>`;

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<GeocodeResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th&addressdetails=1`,
      { headers: { 'User-Agent': 'ERideHub/1.0' } }
    );
    const data = await res.json();
    const a: NominatimAddress = data.address || {};

    // District: county มักเป็น "อำเภอ..." ใน Nominatim ไทย
    const rawDistrict = a.county || a.town || a.city_district || a.municipality || a.city || '';
    const district = rawDistrict.replace(/^อำเภอ\s*/, '').replace(/^เขต\s*/, '').trim();

    // Province: state เป็นจังหวัดใน Nominatim ไทย
    const rawProvince = a.state || '';
    const province = rawProvince.replace(/^จังหวัด\s*/, '').trim();

    // Build clean Thai address (ไม่ใช้ display_name ดิบ)
    const parts: string[] = [];
    const road = a.road || a.footway || a.path || '';
    if (road) parts.push(road);
    const locality = a.hamlet || a.neighbourhood || a.suburb || a.village || '';
    if (locality) parts.push(locality);
    const sub = a.subdistrict || '';
    if (sub) parts.push(`ต.${sub.replace(/^ตำบล\s*/, '')}`);
    if (district) parts.push(`อ.${district}`);
    if (province) parts.push(`จ.${province}`);
    if (a.postcode) parts.push(a.postcode);

    const address = parts.length > 0
      ? parts.join(' ')
      : data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    return { address, district, province };
  } catch {
    return {
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      district: '',
      province: '',
    };
  }
}

export function GoogleMapPicker({ initialLat, initialLng, jumpTo, onLocationSelect }: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    setGeocoding(true);
    const result = await reverseGeocodeNominatim(lat, lng);
    setGeocoding(false);
    setAddress(result.address);
    onLocationSelect(lat, lng, result.address, result.district, result.province);
  }, [onLocationSelect]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstance.current) return;

      const center: [number, number] = (initialLat && initialLng)
        ? [initialLat, initialLng]
        : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];

      const map = L.map(mapRef.current, {
        center,
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // SVG pin — iconAnchor [14,40] = tip of pin aligns exactly with lat/lng
      const pinIcon = L.divIcon({
        html: PIN_SVG,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        className: '',
      });

      const marker = L.marker(center, { draggable: true, icon: pinIcon }).addTo(map);

      mapInstance.current = map;
      markerRef.current = marker;

      updateLocation(center[0], center[1]);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateLocation(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        updateLocation(e.latlng.lat, e.latlng.lng);
      });

      setMapLoading(false);
    }).catch(() => {
      setError('โหลดแผนที่ไม่สำเร็จ');
      setMapLoading(false);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เมื่อ parent ส่ง jumpTo coords มา → เลื่อนแผนที่และหมุดไปตำแหน่งนั้น
  // แล้ว reverse geocode ใหม่ เพื่ออัปเดตที่อยู่ตาม coords ที่กรอก
  useEffect(() => {
    if (!jumpTo || !mapInstance.current || !markerRef.current) return;
    const latlng: [number, number] = [jumpTo.lat, jumpTo.lng];
    markerRef.current.setLatLng(latlng);
    mapInstance.current.setView(latlng, 17);
    // reverse geocode เพื่อแสดงที่อยู่ใหม่ แต่ไม่เรียก onLocationSelect
    // (lat/lng ถูกต้องอยู่แล้ว parent รู้อยู่แล้ว แค่อัปเดต display address)
    setCoords({ lat: jumpTo.lat, lng: jumpTo.lng });
    setGeocoding(true);
    reverseGeocodeNominatim(jumpTo.lat, jumpTo.lng).then((result) => {
      setGeocoding(false);
      setAddress(result.address);
      // แจ้ง parent ด้วยค่าที่ถูกต้อง (รวม district/province จาก geocode)
      onLocationSelect(jumpTo.lat, jumpTo.lng, result.address, result.district, result.province);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo]);

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        const latlng: [number, number] = [c.latitude, c.longitude];
        mapInstance.current?.setView(latlng, 17);
        markerRef.current?.setLatLng(latlng);
        updateLocation(c.latitude, c.longitude);
      },
      () => setError('ไม่สามารถดึงตำแหน่งปัจจุบันได้')
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 260 }}>
        <div ref={mapRef} className="h-full w-full" />
        {mapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
          </div>
        )}
        <button
          type="button"
          onClick={handleMyLocation}
          className="absolute bottom-3 right-3 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:scale-95"
          title="ตำแหน่งปัจจุบัน"
        >
          <Navigation className="h-4 w-4 text-orange-500" />
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Address result */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 space-y-1">
        {geocoding ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>กำลังค้นหาที่อยู่...</span>
          </div>
        ) : address ? (
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700 leading-relaxed">{address}</p>
          </div>
        ) : null}

        {coords && (
          <p className="text-[10px] text-gray-400 pl-5">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        )}
      </div>

      <p className="text-[11px] text-gray-400 text-center">
        แตะแผนที่หรือลากหมุดเพื่อเลือกตำแหน่ง · ที่อยู่เป็นค่าโดยประมาณ
      </p>
    </div>
  );
}
