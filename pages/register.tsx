import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    FaQuestionCircle,
    FaPhoneAlt,
    FaBuilding,
    FaMapMarkerAlt,
    FaCloudUploadAlt,
    FaUser,
    FaEye,
    FaEyeSlash,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import { authAPI } from '../services/api/auth.api';
import LocationPicker from '../components/common/LocationPicker';
import Swal from 'sweetalert2';

export default function Register() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        tradeLicenseNumber: '',
        city: '',
        companyAddress: '',
        fullName: '',
        jobTitle: '',
        email: '',
        password: '',
        phoneNumber: '',
        fleetSize: '',
        vehicleType: ''
    });
    const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number; address?: string; fullAddress?: string } | null>(null);

    // Password validation state
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        upper: false,
        number: false,
        special: false
    });

    const [permissionDenied, setPermissionDenied] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    useEffect(() => {
        const pwd = formData.password;
        setPasswordCriteria({
            length: pwd.length >= 6,
            upper: /[A-Z]/.test(pwd),
            number: /\d/.test(pwd),
            special: /[!@#$%^&*]/.test(pwd)
        });
    }, [formData.password]);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            Swal.fire({
                icon: 'error',
                title: 'Unsupported',
                text: 'Geolocation is not supported by your browser',
                confirmButtonColor: '#FCD34D'
            });
            return;
        }

        setDetectingLocation(true);
        setPermissionDenied(false);

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

                        setLocation({
                            lat: latitude,
                            lng: longitude,
                            address: city,
                            fullAddress: fullAddress
                        });

                        setFormData(prev => ({ ...prev, city }));
                        setPermissionDenied(false);
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed', error);
                } finally {
                    setDetectingLocation(false);
                }
            },
            (error) => {
                console.error('Geolocation error', error);
                setPermissionDenied(true);
                setDetectingLocation(false);
                setFormData(prev => ({ ...prev, city: '' })); // Clear city if denied
            }
        );
    };

    useEffect(() => {
        detectLocation();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setTradeLicenseFile(e.target.files[0]);
        }
    };

    const handleLocationSelect = (loc: { lat: number; lng: number; address?: string; fullAddress?: string }) => {
        setLocation(loc);
        if (loc.address) {
            setFormData(prev => ({ ...prev, city: loc.address || '' }));
        }
        console.log('Selected Location:', loc);
    };

    const _handleCityBlur = async () => {
        if (!formData.city) return;

        try {
            // Forward geocoding - restrict result to city/place
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            if (!token) return;

            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.city)}.json?types=place&limit=1&access_token=${token}`);
            const data = await res.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const [lng, lat] = feature.center;
                setLocation({
                    lat,
                    lng,
                    address: feature.text,
                    fullAddress: feature.place_name
                });
            }
        } catch (error) {
            console.error('City geocoding failed', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.companyName || !formData.tradeLicenseNumber || !formData.email || !formData.password || !tradeLicenseFile) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please fill in all required fields and upload trade license.',
                confirmButtonColor: '#FCD34D',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!passwordCriteria.length || !passwordCriteria.upper || !passwordCriteria.number || !passwordCriteria.special) {
            Swal.fire({
                icon: 'error',
                title: 'Weak Password',
                text: 'Please ensure all password requirements are met.',
                confirmButtonColor: '#FCD34D',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true);

        try {
            // Construct company_data JSON matching API requirements
            const companyData = {
                name: formData.companyName,
                trade_license_number: formData.tradeLicenseNumber,
                city: formData.city,
                address: formData.companyAddress,
                location: location ? {
                    latitude: location.lat,
                    longitude: location.lng
                } : null,
                phone: formData.phoneNumber, // Company phone (using same as contact for now if needed, or just contact phone)
                estimated_fleet_size: parseInt(formData.fleetSize, 10), // Send as integer matching API requirement
                primary_vehicle_type: formData.vehicleType,
                primary_contact: {
                    full_name: formData.fullName,
                    job_title: formData.jobTitle,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phoneNumber
                }
            };

            // Create FormData
            const submitData = new FormData();
            submitData.append('company_data', JSON.stringify(companyData));
            submitData.append('trade_license_file', tradeLicenseFile);

            console.log('📤 Submitting Registration Data...');

            await authAPI.registerCompany(submitData);

            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: 'Your company has been registered. You can now login.',
                confirmButtonColor: '#FCD34D',
                confirmButtonText: 'Go to Login'
            }).then(() => {
                router.push('/login');
            });

        } catch (error: unknown) {
            console.error('Registration failed:', error);

            // Extract error message from new API structure (nested in error object) or fallback to standard
            const errorObj = error as { response?: { data?: { error?: { message?: string }; message?: string } } };
            const errorMessage = errorObj?.response?.data?.error?.message ||
                errorObj?.response?.data?.message ||
                'Something went wrong. Please try again.';

            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: errorMessage,
                confirmButtonColor: '#d33'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
            <Head>
                <title>Register - HAKIM for Business</title>
                <meta name="description" content="Register your business with HAKIM" />
            </Head>

            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FCD34D] rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" />
                            <path d="M12 10H6v6h6v-6z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">HAKIM</h1>
                        <p className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">for Business</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                    <FaQuestionCircle className="w-5 h-5 cursor-pointer hover:text-gray-700 transition-colors" />
                    <FaPhoneAlt className="w-4 h-4 cursor-pointer hover:text-gray-700 transition-colors" />
                </div>
            </nav>

            <main className="max-w-[720px] mx-auto py-10 px-4 sm:px-6">

                {/* Page Title & Subtitle */}
                <div className="text-center mb-12">
                    <h1 className="text-[28px] font-bold text-gray-900 mb-2">Register Your Business</h1>
                    <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                        Join HAKIM for Business and streamline your company's transportation needs.
                        Complete the registration process in three simple steps.
                    </p>
                </div>

                {/* Stepper */}
                <div className="flex justify-center items-center mb-12 text-xs font-medium text-gray-400">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#FCD34D] text-gray-900 flex items-center justify-center font-bold mr-2 text-sm">1</div>
                        <span className="text-gray-900 font-bold">Company Information</span>
                    </div>
                    <div className="w-12 h-[1px] bg-gray-200 mx-4"></div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold mr-2 text-sm">2</div>
                        <span>Contact Person</span>
                    </div>
                    <div className="w-12 h-[1px] bg-gray-200 mx-4"></div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold mr-2 text-sm">3</div>
                        <span>Fleet Information</span>
                    </div>
                </div>

                {/* Main Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 sm:p-10">

                    {/* Section 1: Company Information */}
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <div className="w-8 h-8 bg-[#FCD34D] rounded-full flex items-center justify-center text-gray-900">
                                <FaBuilding className="text-sm" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Company Information & Trade License</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Company Name *</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Enter your company name"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Trade License Number *</label>
                                <input
                                    type="text"
                                    name="tradeLicenseNumber"
                                    value={formData.tradeLicenseNumber}
                                    onChange={handleChange}
                                    placeholder="Enter license number"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Company Location *</label>

                            {/* Replaced placeholder with LocationPicker */}
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
                                        Please click the lock/settings icon in your browser address bar and allow location access, then click Retry.
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
                                <div className="w-full h-64 border border-gray-200 rounded-lg overflow-hidden">
                                    <LocationPicker
                                        onLocationSelect={handleLocationSelect}
                                        initialLocation={location ? { lat: location.lat, lng: location.lng } : undefined}
                                    />
                                </div>
                            )}

                            {!permissionDenied && location && (
                                <p className="mt-2 text-xs text-green-600 flex items-center">
                                    <FaMapMarkerAlt className="mr-1" />
                                    {location.fullAddress || `Selected Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                                </p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-2">City *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    readOnly
                                    placeholder={detectingLocation ? "Detecting city..." : "Auto-detected from location"}
                                    className={`w-64 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none transition-all ${permissionDenied ? 'bg-red-50 border-red-200' : 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                        }`}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Company Address *</label>
                            <textarea
                                name="companyAddress"
                                value={formData.companyAddress}
                                onChange={handleChange}
                                placeholder="Enter complete company address"
                                rows={3}
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Trade License Document *</label>
                            <div className="w-full border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <FaCloudUploadAlt className="text-gray-400 text-xl" />
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    {tradeLicenseFile ? tradeLicenseFile.name : 'Upload your trade license document'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 mb-4">PDF, JPG or PNG files up to 5MB</p>
                                <button type="button" className="px-5 py-2 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 text-xs font-bold rounded-md transition-colors shadow-sm pointe-events-none">
                                    Choose File
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Primary Contact Person */}
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <FaUser className="text-sm" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-600">Primary Contact Person</h2>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 mb-6">
                            <div className="text-blue-500 mt-0.5"><FaQuestionCircle className="w-4 h-4" /></div>
                            <p className="text-xs text-blue-700 leading-tight">These credentials will be used for your business account login</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Job Title *</label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    placeholder="Enter job title"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Email Address * <span className="text-blue-400 font-normal text-[10px] ml-1">(Login Username)</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Password * <span className="text-blue-400 font-normal text-[10px] ml-1">(Login Password)</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create password"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {/* Password Strength Indicators */}
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div className={`text-[10px] flex items-center gap-1 ${passwordCriteria.length ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                        {passwordCriteria.length ? <FaCheckCircle /> : <FaTimesCircle className="text-gray-300" />} 6+ Characters
                                    </div>
                                    <div className={`text-[10px] flex items-center gap-1 ${passwordCriteria.upper ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                        {passwordCriteria.upper ? <FaCheckCircle /> : <FaTimesCircle className="text-gray-300" />} Uppercase Letter
                                    </div>
                                    <div className={`text-[10px] flex items-center gap-1 ${passwordCriteria.number ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                        {passwordCriteria.number ? <FaCheckCircle /> : <FaTimesCircle className="text-gray-300" />} Number
                                    </div>
                                    <div className={`text-[10px] flex items-center gap-1 ${passwordCriteria.special ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                                        {passwordCriteria.special ? <FaCheckCircle /> : <FaTimesCircle className="text-gray-300" />} Special Char (!@#$%^&*)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all"
                            />
                        </div>
                    </section>

                    {/* Section 3: Fleet Size & Type */}
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <FaTruck className="text-sm" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-600">Fleet Size & Type</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Estimated Fleet Size *</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="fleetSize"
                                        value={formData.fleetSize}
                                        onChange={handleChange}
                                        placeholder="Enter fleet size"
                                        min="1"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Primary Vehicle Type *</label>
                                <div className="relative">
                                    <select
                                        name="vehicleType"
                                        value={formData.vehicleType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select vehicle type</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                        <option value="van">Van</option>
                                        <option value="truck">Truck</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>

                </form>

                {/* Footer Text */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-gray-400 font-medium">
                        Need assistance with your registration?
                    </p>
                    <div className="flex justify-center gap-6 text-[11px] font-bold text-[#FCD34D]">
                        <a href="#" className="flex items-center gap-1 hover:underline"><FaPhoneAlt /> Call Support</a>
                        <a href="#" className="flex items-center gap-1 hover:underline"><span className="text-lg">✉</span> Email Us</a>
                        <a href="#" className="flex items-center gap-1 hover:underline"><span className="text-lg">💬</span> Live Chat</a>
                    </div>
                </div>

            </main>

            {/* Global Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <div className="w-5 h-5 bg-[#FCD34D] rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" />
                        </svg>
                    </div>
                    <span>© 2024 HAKIM for Business. All rights reserved.</span>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-gray-700">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-700">Terms of Service</a>
                    <a href="#" className="hover:text-gray-700">Support</a>
                </div>
            </footer>
        </div>
    );
}
