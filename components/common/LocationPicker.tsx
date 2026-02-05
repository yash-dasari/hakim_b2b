import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';



interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; address?: string; fullAddress?: string }) => void;
    initialLocation?: { lat: number; lng: number };
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Keep the latest callback in a ref to avoid stale closures in the map click listener
    const onLocationSelectRef = useRef(onLocationSelect);

    useEffect(() => {
        onLocationSelectRef.current = onLocationSelect;
    }, [onLocationSelect]);

    // Initialize Map
    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return;
        if (!mapboxgl.accessToken) {
            setError('Mapbox access token is missing');
            return;
        }

        try {
            if (!mapboxgl.supported()) {
                setError('mapbox-gl-js not supported by this browser');
                return;
            }

            const defaultCenter = [55.2708, 25.2048] as [number, number];
            const center = initialLocation ? [initialLocation.lng, initialLocation.lat] as [number, number] : defaultCenter;

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: center,
                zoom: 12
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            map.current.on('click', async (e) => {
                const { lng, lat } = e.lngLat;
                updateMarker(lng, lat);

                // 1. Immediate update with coordinates only (for fast UI response)
                if (onLocationSelectRef.current) {
                    onLocationSelectRef.current({ lat, lng });
                }

                // 2. Reverse geocode to get city
                try {
                    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
                    if (!token) return;

                    // Remove type restriction to get full hierarchy (Address -> Place -> Region)
                    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`);
                    const data = await res.json();

                    if (data.features && data.features.length > 0) {
                        // Find specific types in the features list
                        // Mapbox usually returns features from most specific to least specific
                        const findType = (t: string) => data.features.find((f: { id?: string }) => f.id?.startsWith(t));

                        const placeFeature = findType('place');
                        const regionFeature = findType('region');
                        const countryFeature = findType('country');

                        // Use place (City) as primary, fallback to locality if place not found
                        const cityFeature = placeFeature || findType('locality');

                        const city = cityFeature ? cityFeature.text : '';

                        // Use the most specific feature's place_name as the full address
                        const bestFullAddress = data.features[0]?.place_name;

                        // Fallback to manual construction if place_name is missing (unlikely)
                        const region = regionFeature ? regionFeature.text : '';
                        const country = countryFeature ? countryFeature.text : '';
                        const displayParts = [city, region, country].filter(Boolean);
                        const fallbackAddress = displayParts.join(', ');

                        const fullAddress = bestFullAddress || fallbackAddress;

                        console.log('📍 Location details:', { city, fullAddress });

                        if (onLocationSelectRef.current) {
                            onLocationSelectRef.current({
                                lat,
                                lng,
                                address: city, // City input gets City name
                                fullAddress: fullAddress // Display gets formatted address
                            });
                        }
                    }
                } catch (err) {
                    console.error('Reverse geocoding failed', err);
                }
            });

        } catch (err: unknown) {
            console.error('Error initializing map:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError('Failed to load map: ' + errorMessage);
        }
    }, [initialLocation]);

    // Update marker when prop changes
    useEffect(() => {
        if (!map.current || !initialLocation) return;
        const { lat, lng } = initialLocation;
        updateMarker(lng, lat);
        map.current.flyTo({ center: [lng, lat], zoom: 12 });
    }, [initialLocation]);

    const updateMarker = (lng: number, lat: number) => {
        if (!map.current) return;

        if (marker.current) {
            marker.current.setLngLat([lng, lat]);
        } else {
            marker.current = new mapboxgl.Marker({ color: '#FCD34D' })
                .setLngLat([lng, lat])
                .addTo(map.current);
        }
    };

    return (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
            {error ? (
                <div className="flex items-center justify-center h-full bg-gray-100 text-red-500 text-sm">
                    {error}
                </div>
            ) : (
                <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
            )}
            {!error && (
                <div className="absolute top-2 left-2 bg-white/90 px-3 py-1 rounded text-xs font-medium text-gray-700 shadow-sm pointer-events-none">
                    Click map to pin location
                </div>
            )}
        </div>
    );
}
