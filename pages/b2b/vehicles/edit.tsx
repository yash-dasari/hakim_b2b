import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';
import { FaArrowLeft, FaBarcode, FaPalette, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { vehiclesAPI, VehicleBrand, VehicleModel } from '../../../services/api/vehicles.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import SearchableSelect from '../../../components/common/SearchableSelect';

export default function EditVehiclePage() {
    const router = useRouter();
    const { user, company } = useSelector((state: RootState) => state.auth);
    const { id } = router.query;

    // We only proceeded if ID is present, which usually implies edit mode is valid
    const isEditMode = !!id;

    // Image state (kept for compatibility, though obscured in UI)
    const [vehicleImages, setVehicleImages] = useState<{ [key: string]: File | null }>({
        front: null, back: null, left: null, right: null
    });
    const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string | null }>({
        front: null, back: null, left: null, right: null
    });
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
        front: null, back: null, left: null, right: null
    });

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        color: '',
        plateNumber: '',
        vin: '',
        mileage: '',
        plateFormat: 'new', // Default
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // Dynamic Options State
    const [brandOptions, setBrandOptions] = useState<VehicleBrand[]>([]);
    const [modelOptions, setModelOptions] = useState<VehicleModel[]>([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    // State to hold pending model name for pre-filling after async load
    const [pendingModelName, setPendingModelName] = useState<string | null>(null);

    // Helper: Format Detection
    const detectPlateFormat = (plate: string) => {
        // New: 22 G 99720 or 22 AB 99720
        const newFormatRegex = /^\d{2}\s+[A-Za-z]{1,2}\s+\d{5}$/;
        if (newFormatRegex.test(plate)) return 'new';
        return 'old';
    };

    // 1. Fetch Brands & Handle Pre-fill
    React.useEffect(() => {
        if (!router.isReady) return;

        const fetchBrandsAndPrefill = async () => {
            setIsLoadingBrands(true);
            try {
                // Initialize standard fields immediately from query
                const plate = (router.query.plate as string) || '';
                setFormData(prev => ({
                    ...prev,
                    year: (router.query.year as string) || '',
                    color: (router.query.color as string) || '',
                    plateNumber: plate,
                    plateFormat: detectPlateFormat(plate),
                    vin: (router.query.vin as string) || '',
                    mileage: (router.query.mileage as string) || '',
                }));

                const brands = await vehiclesAPI.getBrands();
                setBrandOptions(brands);

                // Handle Make/Model Pre-fill
                // 1. Try ID based match (Most robust)
                if (router.query.makeId) {
                    const makeId = String(router.query.makeId);
                    console.log('🆔 Using ID-based pre-fill. MakeID:', makeId);

                    setFormData(prev => ({ ...prev, make: makeId }));

                    // Set matches directly if IDs are present
                    if (router.query.modelId) {
                        const modelId = String(router.query.modelId);
                        setPendingModelName(modelId); // Using ID as pending name to match by ID
                    } else if (router.query.model) {
                        setPendingModelName(router.query.model as string);
                    }

                } else if (router.query.make) {
                    // 2. Name based match (Fallback)
                    const makeName = router.query.make as string;
                    // Loose match
                    const matchedBrand = brands.find(b =>
                        b.brand_name.toLowerCase().trim() === makeName.toLowerCase().trim()
                    );

                    if (matchedBrand) {
                        setFormData(prev => ({ ...prev, make: String(matchedBrand.brand_id) }));

                        // Store model name to set later
                        if (router.query.model) {
                            console.log('📝 Setting pending model name:', router.query.model);
                            setPendingModelName(router.query.model as string);
                        }
                    } else {
                        console.warn('⚠️ Could not find matching brand for:', makeName);
                        // We do NOT error toast here for Make, as user can just select it.
                        // But good to log.
                    }
                }
            } catch (error) {
                console.error("Failed to fetch brands", error);
            } finally {
                setIsLoadingBrands(false);
            }
        };
        fetchBrandsAndPrefill();
    }, [router.isReady, router.query]); // Depend on router ready

    // 2. Fetch Models when Make changes
    React.useEffect(() => {
        const fetchModels = async () => {
            if (!formData.make) {
                setModelOptions([]);
                return;
            }

            // Only fetch if we don't have models or if make changed (handled by dep array)
            // But we can check if current models belong to this make? API doesn't return make_id in model list easily.
            // So just fetch.

            setIsLoadingModels(true);
            try {
                // formData.make is the brand_id
                console.log('🔄 Fetching models for brand ID:', formData.make);
                const models = await vehiclesAPI.getModels(formData.make);
                console.log('✅ Fetched models:', models.length);
                setModelOptions(models);
            } catch (error) {
                console.error("Failed to fetch models", error);
                setModelOptions([]);
            } finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
    }, [formData.make]);

    // 3. Handle Pending Model Pre-fill (Separated for robustness)
    React.useEffect(() => {
        if (pendingModelName && modelOptions.length > 0) {
            console.log('🔍 Attempting to match pending model:', pendingModelName);

            // Try exact match first
            let matchedModel = modelOptions.find(m =>
                m.model_name.toLowerCase().trim() === pendingModelName.toLowerCase().trim()
            );

            // If not found, try finding by ID if pendingModelName happens to be an ID?
            // Unlikely from current navigation, but good safety.
            if (!matchedModel) {
                matchedModel = modelOptions.find(m => m.model_id === pendingModelName);
            }

            if (matchedModel) {
                console.log('✅ Found matched model:', matchedModel);
                setFormData(prev => ({ ...prev, model: String(matchedModel?.model_id || '') }));
                setPendingModelName(null); // Clear it so we don't re-set
            } else {
                console.warn('❌ Could not find match for model:', pendingModelName, 'Available options:', modelOptions.map(m => m.model_name));
                // Toast to help debug visually
                toast.error(`Could not auto-select model '${pendingModelName}'. Please select manually.`);
                // setPendingModelName(null); // Optional: stop trying
            }
        }
    }, [modelOptions, pendingModelName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formData.make) errors.make = 'Make is required';
        if (!formData.model) errors.model = 'Model is required';
        if (!formData.year) errors.year = 'Year is required';
        if (!formData.color) errors.color = 'Color is required';
        if (!formData.plateNumber) errors.plateNumber = 'Plate Number is required';

        // Image validation removed

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) toast.error('Please fill in all required fields');
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (!id) {
            toast.error('Vehicle ID missing');
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append('make', formData.make);
            data.append('model', formData.model);
            data.append('year', formData.year);
            data.append('color', formData.color);
            data.append('license_plate', formData.plateNumber);
            if (formData.mileage) data.append('mileage_number', formData.mileage);
            if (formData.vin) data.append('vin', formData.vin);

            console.log('🔄 Calling Update API...');
            const response = await vehiclesAPI.updateVehicle(id as string, data);

            if (response.success || response.id || response.vehicle_id) {
                toast.success('Vehicle updated successfully');
                router.push('/b2b/vehicles');
            } else {
                toast.error('Failed to update vehicle: ' + (response.message || 'Unknown error'));
            }
        } catch (error: unknown) {
            console.error('Failed to update vehicle', error);
            const errorObj = error as { response?: { data?: { detail?: Array<{ msg?: string }> } }; message?: string };
            const errorData = errorObj?.response?.data;
            const errorMessage = errorObj?.message || 'Unknown error';
            toast.error('Error updating vehicle: ' + (errorData?.detail?.[0]?.msg || errorMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            title="Edit Vehicle"
            subtitle="Update vehicle details"
        >
            <div className="max-w-3xl mx-auto pt-8 pb-12">
                {/* Stepper omitted for Edit mode or kept simple */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Edit Vehicle Information</h2>
                    </div>

                    <div className="p-8 space-y-6">

                        {/* Make */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Vehicle Make <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                name="make"
                                value={formData.make}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, make: value, model: '' }));
                                    if (formErrors.make) setFormErrors(prev => ({ ...prev, make: '' }));
                                }}
                                options={brandOptions.map(brand => ({ value: String(brand.brand_id), label: brand.brand_name }))}
                                placeholder={isLoadingBrands ? 'Loading Brands...' : 'Select Make'}
                                disabled={isLoadingBrands}
                                error={formErrors.make}
                            />
                        </div>

                        {/* Model */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Vehicle Model <span className="text-red-500">*</span></label>
                            {modelOptions.length > 0 ? (
                                <SearchableSelect
                                    name="model"
                                    value={formData.model}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, model: value }));
                                        if (formErrors.model) setFormErrors(prev => ({ ...prev, model: '' }));
                                    }}
                                    options={modelOptions.map(model => ({ value: String(model.model_id), label: model.model_name }))}
                                    placeholder={isLoadingModels ? 'Loading Models...' : 'Select Model'}
                                    disabled={!formData.make || isLoadingModels}
                                    error={formErrors.model}
                                />
                            ) : (
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder={!formData.make ? "Select a make first" : (isLoadingModels ? "Loading models..." : "Enter Model")}
                                    disabled={!formData.make || isLoadingModels}
                                    className={`w-full px-4 py-3 border ${formErrors.model ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] disabled:bg-gray-50`}
                                />
                            )}
                            {modelOptions.length === 0 && formErrors.model && <p className="text-xs text-red-500">{formErrors.model}</p>}
                        </div>

                        {/* Year */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Vehicle Year <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${formErrors.year ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D]`}
                                >
                                    <option value="">Select Year</option>
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            {formErrors.year && <p className="text-xs text-red-500">{formErrors.year}</p>}
                        </div>

                        {/* Mileage */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Mileage (KMs)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="mileage"
                                    value={formData.mileage}
                                    onChange={handleChange}
                                    placeholder="e.g. 5000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">km</span>
                            </div>
                        </div>

                        {/* Color */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">Vehicle Color <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="e.g. White, Silver"
                                    className={`w-full px-4 py-3 border ${formErrors.color ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><FaPalette /></div>
                            </div>
                            {formErrors.color && <p className="text-xs text-red-500">{formErrors.color}</p>}
                        </div>

                        {/* Plate Number & Format Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-700 block">License Plate <span className="text-red-500">*</span></label>

                            {/* Format Selector */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, plateFormat: 'new', plateNumber: '' }))}
                                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.plateFormat === 'new' ? 'border-[#FCD34D] bg-[#FCD34D]/5' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.plateFormat === 'new' ? 'border-[#FCD34D]' : 'border-gray-300'}`}>
                                            {formData.plateFormat === 'new' && <div className="w-2 h-2 bg-[#FCD34D] rounded-full" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">New Format</span>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-16 w-full relative">
                                        <img src="/assets/plates/new-plate.png" alt="New Format" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, plateFormat: 'old', plateNumber: '' }))}
                                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.plateFormat === 'old' ? 'border-[#FCD34D] bg-[#FCD34D]/5' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.plateFormat === 'old' ? 'border-[#FCD34D]' : 'border-gray-300'}`}>
                                            {formData.plateFormat === 'old' && <div className="w-2 h-2 bg-[#FCD34D] rounded-full" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">Old Format</span>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-16 w-full relative">
                                        <img src="/assets/plates/old-plate.png" alt="Old Format" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            </div>

                            {/* Inputs (Same logic as add.tsx) */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                {formData.plateFormat === 'new' ? (
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            maxLength={2}
                                            placeholder="22"
                                            className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                            onFocus={(e) => {
                                                // If starting empty, ensure we parse correctly. 
                                                // Actually for pre-fill, we need to populate this input value from formData.plateNumber.
                                                // Simplified for edit: We just let user type if they want to change.
                                                // BUT WAIT: The input values are not bound to state pieces!
                                                // In add.tsx, they were uncontrolled inputs that updated state.
                                                // For EDIT, we need them to be controlled or initialized.
                                                // Let's parse formData.plateNumber to set defaultValues?
                                                // Or better, bind them to helper state.
                                            }}
                                            // Controlled inputs required for Edit! 
                                            // Extracting parts from state for value prop:
                                            value={formData.plateNumber.split(' ')[0] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const current = formData.plateNumber.split(' ');
                                                const letter = current[1] || '';
                                                const num = current[2] || '';
                                                setFormData(prev => ({ ...prev, plateNumber: `${val} ${letter} ${num}`.trim() }));
                                            }}
                                        />
                                        <input
                                            type="text"
                                            maxLength={2}
                                            placeholder="GG"
                                            className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D] uppercase"
                                            value={formData.plateNumber.split(' ')[1] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                                                const current = formData.plateNumber.split(' ');
                                                const code = current[0] || '';
                                                const num = current[2] || '';
                                                setFormData(prev => ({ ...prev, plateNumber: `${code} ${val} ${num}`.trim() }));
                                            }}
                                        />
                                        <input
                                            type="text"
                                            maxLength={5}
                                            placeholder="99720"
                                            className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D] tracking-widest"
                                            value={formData.plateNumber.split(' ')[2] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const current = formData.plateNumber.split(' ');
                                                const code = current[0] || '';
                                                const letter = current[1] || '';
                                                setFormData(prev => ({ ...prev, plateNumber: `${code} ${letter} ${val}`.trim() }));
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            maxLength={2}
                                            placeholder="54"
                                            className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                            value={formData.plateNumber.split(' ')[0] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const current = formData.plateNumber.split(' ');
                                                const num = current[1] || '';
                                                setFormData(prev => ({ ...prev, plateNumber: `${val} ${num}`.trim() }));
                                            }}
                                        />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="8306"
                                            className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D] tracking-widest"
                                            value={formData.plateNumber.split(' ')[1] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const current = formData.plateNumber.split(' ');
                                                const code = current[0] || '';
                                                setFormData(prev => ({ ...prev, plateNumber: `${code} ${val}`.trim() }));
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            {formErrors.plateNumber && <p className="text-xs text-red-500">{formErrors.plateNumber}</p>}
                        </div>

                        {/* VIN */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">VIN Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleChange}
                                    placeholder="Enter 17-character VIN (Optional)"
                                    maxLength={17}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] font-mono tracking-wide"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><FaBarcode className="text-lg" /></div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <FaArrowLeft className="text-xs" /> Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2.5 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : <><FaEdit className="text-xs" /> Update Vehicle</>}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
