import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import { useRouter } from 'next/router';
import { FaCog, FaSearch, FaCheck, FaTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { vehiclesAPI, Vehicle as ApiVehicle } from '../../../services/api/vehicles.api';
import { servicesAPI, ServiceCategory, Service, ServiceProviderInfo, NearbyServiceCenterPayload, BatchBookingPayload } from '../../../services/api/services.api';
import LocationPicker from '../../../components/common/LocationPicker';
import { toast } from 'react-hot-toast';

// Use interface from vehicles.api or define UI specific one if needed
interface Vehicle extends ApiVehicle {
    license_plate?: string; // Add this field
    makeModelYear: string; // Helper for display
    lastService: string; // Helper for display
}

export default function CreateServiceRequestPage() {
    const router = useRouter();
    const { company } = useSelector((state: RootState) => state.auth);

    // Multi-select state
    const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [notes, setNotes] = useState<{ [key: string]: string }>({});

    // Vehicle Data State
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

    // Initial Vehicle Fetch
    useEffect(() => {
        if (company?.id) {
            fetchVehicles();
        }
    }, [company?.id]);

    const fetchVehicles = async () => {
        setIsLoadingVehicles(true);
        try {
            if (!company?.id) return;
            const response = await vehiclesAPI.getVehicles(company.id, { per_page: 100 }); // Fetch enough for selection
            if (response.success && response.data?.vehicles) {
                const mapped: Vehicle[] = response.data.vehicles
                    .map((v: ApiVehicle & { vehicle_id?: string; vehicle_reference_id?: string; last_service_date?: string }) => ({
                        ...v,
                        id: v.id || v.vehicle_id || v.vehicle_reference_id || '', // Ensure we have an ID using all possible fields
                        makeModelYear: `${v.make} ${v.model} ${v.year}`,
                        lastService: v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : 'N/A'
                    }))
                    .filter((v): v is Vehicle => !!v.id); // Filter out vehicles without IDs
                console.log('Mapped Vehicles:', mapped);
                setVehicles(mapped);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to load vehicles');
        } finally {
            setIsLoadingVehicles(false);
        }
    };

    // Service State
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    const [services, setServices] = useState<Service[]>([]); // Use Service interface if exported, or any for now
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [isLoadingServices, setIsLoadingServices] = useState(false);

    // Schedule State
    const [scheduleOptions, setScheduleOptions] = useState<string[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledHour, setScheduledHour] = useState('12');
    const [scheduledMinute, setScheduledMinute] = useState('00');
    const [scheduledAmPm, setScheduledAmPm] = useState('PM');

    // Dependent State
    const [availableProviders, setAvailableProviders] = useState<ServiceProviderInfo[]>([]);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [availableLocations, setAvailableLocations] = useState<string[]>([]);
    const [serviceCenters, setServiceCenters] = useState<Array<{ id?: string; service_center_id?: string; uuid?: string; name?: string; location?: string; address?: string; latitude?: string | number; longitude?: string | number;[key: string]: unknown }>>([]); // Store full objects
    const [selectedLocation, setSelectedLocation] = useState('');
    const [pickupAddress, setPickupAddress] = useState('');
    const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    // Map State
    const [showMap, setShowMap] = useState(false);
    const [isMobileProvider, setIsMobileProvider] = useState(false); // Tracks if it's ANY mobile service (Van OR Valet)
    const [isVanService, setIsVanService] = useState(false); // Specific track for VAN
    const [isTowService, setIsTowService] = useState(false); // Specific track for Towing
    const [dropOffAddress, setDropOffAddress] = useState('');
    const [dropOffCoords, setDropOffCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLoadingNearby, setIsLoadingNearby] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchServices(selectedCategoryId);
        } else {
            setServices([]);
            setSelectedServiceId('');
        }
    }, [selectedCategoryId]);

    // Update dependent dropdowns when service changes
    useEffect(() => {
        if (selectedServiceId && services.length > 0) {
            const service = services.find(s => s.service_catalog_id === selectedServiceId);
            if (service) {
                setAvailableProviders(service.service_providers_info || []);

                // Handle Schedule Options
                if (service.schedule && Array.isArray(service.schedule)) {
                    setScheduleOptions(service.schedule);
                    if (service.schedule.length === 1) {
                        setSelectedSchedule(service.schedule[0]);
                    } else {
                        setSelectedSchedule('');
                    }
                } else {
                    setScheduleOptions([]);
                    setSelectedSchedule('');
                }

                // If we have coordinates, re-fetch nearby centers for this service
                // This ensures we get valid Center UUIDs instead of static strings like "On-Site"
                if (selectedCoords) {
                    handleLocationSelect({
                        lat: selectedCoords.latitude,
                        lng: selectedCoords.longitude,
                        address: pickupAddress, // Preserve address if we have it
                        fullAddress: pickupAddress
                    });
                } else {
                    // If no coords yet, wait for auto-detect or user pin
                    setAvailableLocations([]);
                }
            }
        } else {
            setAvailableProviders([]);
            setAvailableLocations([]);
            setScheduleOptions([]);
            setSelectedSchedule('');
        }
        // Reset selections
        setSelectedProviderId('');
        setSelectedLocation('');
        setShowMap(false);
    }, [selectedServiceId, services]);

    // Check if provider needs map selection
    useEffect(() => {
        if (selectedProviderId && availableProviders.length > 0) {
            const provider = availableProviders.find(p => p.provider_id === selectedProviderId);
            if (provider) {
                // Logic to determine if map is needed based on provider name/description
                // User examples: "Hakim van", "PickUp Valet", "Mini Van", "Towing", "Tow Partner"
                const isMobile = /valet|van|mobile|tow|recovery/i.test(provider.name || '') || /pick up|pickup|tow|recovery/i.test(provider.description || '');
                // Van Service if name has Van but NOT Valet/Towing (to stay safe)
                const isVan = /van/i.test(provider.name || '') && !/valet|tow|recovery/i.test(provider.name || '');
                // Tow Service detection
                const isTow = /tow|recovery/i.test(provider.name || '') || /tow|recovery/i.test(provider.description || '');

                setIsMobileProvider(isMobile);
                setIsVanService(isVan);
                setIsTowService(isTow);

                // Show Map for ALL providers (Mobile needs it for pickup, Service Center needs it for auto-detected location)
                setShowMap(true);

                // Trigger location fetch (get nearby centers) if we have coordinates
                // This is needed for:
                // 1. Service Center: To populate the list of nearby centers
                // 2. Valet: To populate the list of destination centers
                // 3. Van/Tow: Harmless (dropdown hidden by UI anyway) but good for consistency
                if (selectedCoords) {
                    handleLocationSelect({
                        lat: selectedCoords.latitude,
                        lng: selectedCoords.longitude,
                        address: pickupAddress,
                        fullAddress: pickupAddress
                    });
                }
            }
        } else {
            setShowMap(false);
            setIsMobileProvider(false);
            setIsVanService(false);
            setIsTowService(false);
            setServiceCenters([]); // Clear when no provider
            setAvailableLocations([]);
        }
    }, [selectedProviderId, availableProviders, services, selectedServiceId]);

    const [permissionDenied, setPermissionDenied] = useState(false);

    // Auto-detect location on mount
    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            console.log('Geolocation not supported');
            setPermissionDenied(true);
            return;
        }

        setPermissionDenied(false); // Reset
        toast.loading('Detecting your location...', { id: 'loc-detect' });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
                    if (token) {
                        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`);
                        const data = await res.json();

                        let city = '';
                        let fullAddress = '';

                        if (data.features && data.features.length > 0) {
                            const findType = (t: string) => data.features.find((f: { id?: string }) => f.id?.startsWith(t));
                            const placeFeature = findType('place');
                            const cityFeature = placeFeature || findType('locality');
                            city = cityFeature ? cityFeature.text : '';
                            fullAddress = data.features[0]?.place_name || city;
                        }

                        const locationObj = {
                            lat: latitude,
                            lng: longitude,
                            address: city,
                            fullAddress: fullAddress
                        };

                        // Auto-select this location (State only, no API call yet)
                        // API will be triggered when Provider is selected via useEffect
                        const address = locationObj.fullAddress || locationObj.address || `${locationObj.lat.toFixed(4)}, ${locationObj.lng.toFixed(4)}`;
                        setPickupAddress(address);
                        setSelectedCoords({ latitude: locationObj.lat, longitude: locationObj.lng });

                        toast.success('Location detected', { id: 'loc-detect' });
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed', error);
                    toast.error('Failed to get address details', { id: 'loc-detect' });
                }
            },
            (error) => {
                console.error('Geolocation error', error);
                toast.error('Location access denied', { id: 'loc-detect' });
                setPermissionDenied(true);
            }
        );
    };

    const handleLocationSelect = async (location: { lat: number; lng: number; address?: string; fullAddress?: string }) => {
        // Always update location state (auto-detected or manually picked)
        // This ensures that if the user selects a mobile provider LATER, the auto-detected location is already there.
        const address = location.fullAddress || location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        setPickupAddress(address);
        setSelectedCoords({ latitude: location.lat, longitude: location.lng });

        // Search for nearby centers (For both Mobile as Destination, and Standard as Service Center)
        // For Mobile, we use the picked up location as the reference point to find nearest centers
        setIsLoadingNearby(true);

        try {
            const payload: NearbyServiceCenterPayload = {
                latitude: location.lat,
                longitude: location.lng,
                category_id: selectedCategoryId // Optional filter
            };

            const response = await servicesAPI.getNearbyServiceCenters(payload);

            if (response.success && Array.isArray(response.data)) {
                // Store full objects for payload construction
                const centers = response.data as Service[];
                setServiceCenters(centers as Array<Service & { [key: string]: unknown }>);

                // Fallback: If data is just strings, use it. If objects, map .name
                const newLocations = centers.map((item: { name?: string; location?: string }) => item.name || item.location || "Nearby Center");
                setAvailableLocations(newLocations);

                // Auto-select the first one if available to be helpful
                if (centers.length > 0) {
                    const firstCenter = (centers[0] as unknown) as { id?: string; service_center_id?: string; uuid?: string; name?: string;[key: string]: unknown };
                    const firstId = firstCenter.id || firstCenter.service_center_id || firstCenter.uuid || firstCenter.name || '';
                    if (firstId) {
                        setSelectedLocation(firstId);
                    }
                }


            } else {
                toast.error('No service centers found nearby.');
                setAvailableLocations([]);
                setServiceCenters([]);
            }
        } catch (error) {
            console.error('Error fetching nearby centers:', error);
            toast.error('Failed to find nearby centers');
        } finally {
            setIsLoadingNearby(false);
        }
    };

    const fetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
            const response = await servicesAPI.getServiceCategories();
            if (response.success) {
                setCategories(response.data);
            } else {
                toast.error('Failed to load service categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading service categories');
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const fetchServices = async (categoryId: string) => {
        setIsLoadingServices(true);
        try {
            const response = await servicesAPI.getServices(categoryId);
            if (response.success) {
                setServices(response.data);
            } else {
                toast.error('Failed to load services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Error loading services');
        } finally {
            setIsLoadingServices(false);
        }
    };

    const handleNoteChange = (vehicleId: string, note: string) => {
        setNotes(prev => ({ ...prev, [vehicleId]: note }));
    };


    // Filter logic update
    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.makeModelYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.license_plate && vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleVehicleSelection = (id: string) => {
        const newSet = new Set(selectedVehicleIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedVehicleIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedVehicleIds.size === filteredVehicles.length && filteredVehicles.length > 0) {
            setSelectedVehicleIds(new Set());
        } else {
            const newSet = new Set(filteredVehicles.map(v => v.id));
            setSelectedVehicleIds(newSet);
        }
    };

    const handleSubmit = async () => {
        if (!company?.id) {
            toast.error('Company information missing');
            return;
        }
        if (selectedVehicleIds.size === 0) {
            toast.error('Please select at least one vehicle');
            return;
        }
        if (!selectedServiceId || !selectedProviderId) {
            toast.error('Please select a service and provider');
            return;
        }

        if (scheduleOptions.length > 1 && !selectedSchedule) {
            toast.error('Please select a schedule type');
            return;
        }

        if (selectedSchedule === 'Scheduled' && (!scheduledDate || !scheduledHour || !scheduledMinute)) {
            toast.error('Please select date and time for scheduled service');
            return;
        }

        if (isMobileProvider && !pickupAddress) {
            toast.error('Please pin a pickup location');
            return;
        }

        if (isTowService && !dropOffAddress) {
            toast.error('Please pin a drop off location');
            return;
        }

        if (!selectedLocation && !isLoadingNearby && !isVanService && !isTowService) {
            toast.error('Please select a service center location');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting booking request...');

        try {
            // Calculate scheduled_at
            let scheduledAt = new Date().toISOString();
            if (selectedSchedule === 'Scheduled' && scheduledDate) {
                // Convert 12h to 24h
                let hours = parseInt(scheduledHour);
                if (scheduledAmPm === 'PM' && hours < 12) hours += 12;
                if (scheduledAmPm === 'AM' && hours === 12) hours = 0;

                const timeString = `${hours.toString().padStart(2, '0')}:${scheduledMinute}:00`;
                const date = new Date(`${scheduledDate}T${timeString}`);

                // Validate time is at least 30 mins in future
                const now = new Date();
                const diffMs = date.getTime() - now.getTime();
                const thirtyMinsMs = 30 * 60 * 1000;

                if (diffMs < thirtyMinsMs) {
                    toast.dismiss(toastId);
                    toast.error('Scheduled time must be at least 30 minutes in the future');
                    setIsSubmitting(false); // Enable button if validation fails
                    return;
                }

                scheduledAt = date.toISOString();
            }

            // Construct payload
            const bookingsPayload: BatchBookingPayload = {
                company_id: company.id,
                bookings: Array.from(selectedVehicleIds).map(vehicleId => {
                    const provider = availableProviders.find(p => p.provider_id === selectedProviderId);

                    // For Van and Tow, we might not have a service center ID (destination).
                    let serviceCenterId: string | undefined = (isVanService || isTowService) ? undefined : selectedLocation;
                    let dropoffAddress = '';
                    let dropoffCoordinates: { latitude: number; longitude: number } | undefined = undefined;

                    if (isTowService) {
                        // Use manual drop off for Tow
                        dropoffAddress = dropOffAddress;
                        if (dropOffCoords) {
                            dropoffCoordinates = {
                                latitude: dropOffCoords.latitude,
                                longitude: dropOffCoords.longitude
                            };
                        }
                    } else if (!isVanService) {
                        // Try to find full object in serviceCenters
                        const center = serviceCenters.find(c => (c.id || c.service_center_id || c.uuid) === selectedLocation || c.name === selectedLocation);

                        if (center) {
                            serviceCenterId = center.id || center.service_center_id || center.uuid || undefined;
                            dropoffAddress = center.address || center.location || center.name || '';
                            if (center.latitude && center.longitude) {
                                const lat = typeof center.latitude === 'string' ? parseFloat(center.latitude) : center.latitude;
                                const lng = typeof center.longitude === 'string' ? parseFloat(center.longitude) : center.longitude;
                                if (!isNaN(lat) && !isNaN(lng)) {
                                    dropoffCoordinates = {
                                        latitude: lat,
                                        longitude: lng
                                    };
                                }
                            }
                        }
                    }

                    const item: { vehicle_id: string; service_catalog_id: string; booking_type: string; scheduled_type?: string | null; scheduled_at: string; pickup_coordinates?: { latitude: number; longitude: number }; dropoff_coordinates?: { latitude: number; longitude: number }; pickup_address?: string; dropoff_address?: string; notes?: string; service_provider_id: string; service_center_id?: string } = {
                        vehicle_id: vehicleId,
                        service_catalog_id: selectedServiceId,
                        service_provider_id: selectedProviderId,
                        booking_type: selectedSchedule ? selectedSchedule.toLowerCase() : 'scheduled',
                        scheduled_at: scheduledAt,
                        notes: notes[vehicleId] || '',
                        service_center_id: serviceCenterId || undefined
                    };

                    if (selectedSchedule !== 'Express') {
                        item.scheduled_type = selectedSchedule ? selectedSchedule.toLowerCase() : 'scheduled';
                    }

                    if (dropoffAddress) item.dropoff_address = dropoffAddress;
                    if (dropoffCoordinates) item.dropoff_coordinates = dropoffCoordinates;

                    if (isMobileProvider) {
                        item.pickup_address = pickupAddress;
                        if (selectedCoords) {
                            item.pickup_coordinates = {
                                latitude: selectedCoords.latitude,
                                longitude: selectedCoords.longitude
                            };
                        } else {
                            item.pickup_coordinates = { latitude: 0, longitude: 0 };
                        }
                    }

                    return item;
                })
            };

            await servicesAPI.createBatchBooking(bookingsPayload);
            toast.success('Bookings created successfully', { id: toastId });
            router.push('/b2b/services/requests');
        } catch (error) {
            console.error('Booking submission failed', error);
            toast.error('Failed to create bookings', { id: toastId });
        } finally {
            setIsSubmitting(false); // Always re-enable button
        }
    };

    return (
        <AdminLayout
            title="Service Request"
            subtitle="Submit a new service request for your vehicles"
            headerActions={
                <div className="flex items-center gap-3 text-gray-400">
                    <FaCog className="hover:text-gray-600 cursor-pointer" />
                </div>
            }
        >
            <div className="space-y-6">

                {/* Service Details Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-6">Service Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Select Category</label>
                            <div className="relative">
                                <select
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                    disabled={isLoadingCategories}
                                >
                                    <option value="">{isLoadingCategories ? 'Loading...' : 'Choose a category'}</option>
                                    {categories.map(category => (
                                        <option key={category.category_id} value={category.category_id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Service */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Select Service</label>
                            <div className="relative">
                                <select
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D] ${(isLoadingServices || !selectedCategoryId) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoadingServices || !selectedCategoryId}
                                >
                                    <option value="">{isLoadingServices ? 'Loading...' : 'Choose a service'}</option>
                                    {services.map(service => (
                                        <option key={service.service_catalog_id} value={service.service_catalog_id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Schedule Type - Only if multiple options exist */}
                        {scheduleOptions.length > 1 && (
                            <div className="space-y-1.5 animate-fadeIn">
                                <label className="text-xs font-bold text-gray-700 block">Schedule Type</label>
                                <div className="flex gap-4">
                                    {scheduleOptions.map(option => (
                                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="schedule_type"
                                                value={option}
                                                checked={selectedSchedule === option}
                                                onChange={(e) => setSelectedSchedule(e.target.value)}
                                                className="w-4 h-4 text-[#FCD34D] border-gray-300 focus:ring-[#FCD34D]"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Scheduled Date & Time - If "Scheduled" is selected */}
                        {selectedSchedule === 'Scheduled' && (
                            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">Preferred Date</label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        min={new Date().toLocaleDateString('en-CA')}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">Preferred Time</label>
                                    <div className="flex gap-2">
                                        {/* Hour */}
                                        <div className="relative flex-1">
                                            <select
                                                value={scheduledHour}
                                                onChange={(e) => setScheduledHour(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                                    <option key={h} value={h.toString().padStart(2, '0')}>
                                                        {h.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <span className="self-center font-bold">:</span>
                                        {/* Minute */}
                                        <div className="relative flex-1">
                                            <select
                                                value={scheduledMinute}
                                                onChange={(e) => setScheduledMinute(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                                                    <option key={m} value={m.toString().padStart(2, '0')}>
                                                        {m.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* AM/PM */}
                                        <div className="relative flex-1">
                                            <select
                                                value={scheduledAmPm}
                                                onChange={(e) => setScheduledAmPm(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Provider */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Service Provider</label>
                            <div className="relative">
                                <select
                                    value={selectedProviderId}
                                    onChange={(e) => setSelectedProviderId(e.target.value)}
                                    className={`w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D] ${(!selectedServiceId || availableProviders.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!selectedServiceId || availableProviders.length === 0}
                                >
                                    <option value="">Choose a provider</option>
                                    {availableProviders.map(provider => (
                                        <option key={String(provider.provider_id)} value={String(provider.provider_id)}>
                                            {provider.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Map for Mobile Providers */}
                        {showMap && (
                            <div className="md:col-span-2 space-y-1.5 animate-fadeIn">
                                <label className="text-xs font-bold text-gray-700 block">
                                    {isMobileProvider
                                        ? (pickupAddress ? 'Pickup Location Selected' : 'Pin your pickup location')
                                        : 'Pin location to find nearby centers'
                                    }
                                </label>
                                {permissionDenied ? (
                                    <div className="w-full h-64 border border-red-200 bg-red-50 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                            <FaTimesCircle className="text-red-500 text-xl" />
                                        </div>
                                        <h3 className="text-sm font-bold text-red-800 mb-1">Permission Denied</h3>
                                        <p className="text-xs text-red-600 mb-2 max-w-xs">
                                            We cannot detect your location because permission was denied.
                                        </p>
                                        <p className="text-[10px] text-red-500 mb-4 max-w-xs">
                                            Please allow location access in your browser settings and try again.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={detectLocation}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors shadow-sm"
                                        >
                                            Retry Detection
                                        </button>
                                    </div>
                                ) : (
                                    <LocationPicker
                                        onLocationSelect={handleLocationSelect}
                                        initialLocation={selectedCoords ? { lat: selectedCoords.latitude, lng: selectedCoords.longitude } : undefined}
                                    />
                                )}
                                {isMobileProvider && pickupAddress && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-2 animate-fadeIn">
                                        <div className="mt-0.5 text-yellow-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Selected Pickup Address:</p>
                                            <p className="text-sm text-gray-700">{pickupAddress}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Drop Off Location Map - ONLY for Tow Service */}
                        {isTowService && (
                            <div className="md:col-span-2 space-y-1.5 animate-fadeIn mt-4 border-t border-gray-100 pt-4">
                                <label className="text-xs font-bold text-gray-700 block">
                                    {dropOffAddress ? 'Drop Off Location Selected' : 'Pin your drop off location'}
                                </label>
                                <LocationPicker
                                    onLocationSelect={(loc) => {
                                        const address = loc.fullAddress || loc.address || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
                                        setDropOffAddress(address);
                                        setDropOffCoords({ latitude: loc.lat, longitude: loc.lng });
                                    }}
                                    initialLocation={dropOffCoords ? { lat: dropOffCoords.latitude, lng: dropOffCoords.longitude } : (selectedCoords ? { lat: selectedCoords.latitude, lng: selectedCoords.longitude } : undefined)}
                                />
                                {dropOffAddress && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-2 animate-fadeIn">
                                        <div className="mt-0.5 text-yellow-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">Selected Drop Off Address:</p>
                                            <p className="text-sm text-gray-700">{dropOffAddress}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Location Dropdown - Hide if Van Service or Tow Service */}
                        {(!isVanService && !isTowService) && (
                            <div className="space-y-1.5 animate-fadeIn">
                                <label className="text-xs font-bold text-gray-700 block">
                                    {isMobileProvider ? 'Destination Center' : 'Service Center Location'}
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className={`w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D] ${(!selectedProviderId && !isMobileProvider) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={(!selectedProviderId && !isMobileProvider) || (availableLocations.length === 0 && !isLoadingNearby && !isMobileProvider)}
                                    >
                                        <option value="">
                                            {isLoadingNearby ? 'Searching nearby...' : (availableLocations.length === 0 ? (isMobileProvider ? 'No centers available' : 'Select on map') : 'Choose a location')}
                                        </option>
                                        {serviceCenters.length > 0 ? (
                                            serviceCenters.map((center, index) => {
                                                const id = center.id || center.service_center_id || center.uuid || center.name;
                                                return (
                                                    <option key={id || index} value={id}>
                                                        {center.name || center.location || "Center " + (index + 1)}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            availableLocations.map((location, index) => (
                                                <option key={index} value={location}>
                                                    {location}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Select Vehicle Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-bold text-gray-900">Select Vehicle</h2>
                        <span className="text-xs text-gray-500">{filteredVehicles.length} vehicles available</span>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 text-xs" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by make, model, or plate number..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FCD34D] bg-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                    <th className="px-4 py-3 w-16">
                                        <div
                                            className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all ${selectedVehicleIds.size === filteredVehicles.length && filteredVehicles.length > 0 ? 'bg-[#FCD34D] border-[#FCD34D]' : 'border-gray-300 bg-white hover:border-[#FCD34D]'}`}
                                            onClick={toggleSelectAll}
                                        >
                                            {selectedVehicleIds.size === filteredVehicles.length && filteredVehicles.length > 0 && <FaCheck className="text-gray-900 text-[10px]" />}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3">Car Make/Model/Year</th>
                                    <th className="px-4 py-3">Plate Number</th>
                                    <th className="px-4 py-3">Last Service Date/Time</th>
                                    <th className="px-4 py-3">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoadingVehicles ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <svg className="animate-spin h-8 w-8 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredVehicles.map((vehicle) => {
                                    const isSelected = selectedVehicleIds.has(vehicle.id);
                                    return (
                                        <tr
                                            key={vehicle.id}
                                            className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-yellow-50/10' : ''}`}
                                            onClick={() => toggleVehicleSelection(vehicle.id)}
                                        >
                                            <td className="px-4 py-4">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-[#FCD34D] border-[#FCD34D]' : 'border-gray-300 hover:border-[#FCD34D]'
                                                    }`}>
                                                    {isSelected && <FaCheck className="text-gray-900 text-[10px]" />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-700">{vehicle.makeModelYear}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">{vehicle.license_plate}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{vehicle.last_service_date}</td>
                                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="text"
                                                    placeholder="Add a note..."
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FCD34D]"
                                                    value={notes[vehicle.id] || ''}
                                                    onChange={(e) => handleNoteChange(vehicle.id, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-8 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors ${isSubmitting
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900'
                            }`}
                    >
                        {isSubmitting ? 'Processing...' : `Submit Request (${selectedVehicleIds.size})`}
                    </button>
                </div>

            </div>
        </AdminLayout>
    );
}
