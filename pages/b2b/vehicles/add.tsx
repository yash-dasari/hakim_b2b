import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/AdminLayout';
import Cookies from 'js-cookie';
import { FaArrowLeft, FaCar, FaCheck, FaInfoCircle, FaBarcode, FaPlus, FaPalette, FaImage, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { vehiclesAPI, VehicleBrand, VehicleModel } from '../../../services/api/vehicles.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { useTranslations } from 'next-intl';

export default function AddVehiclePage() {
    const router = useRouter();
    const t = useTranslations('addVehicle');
    const tCommon = useTranslations('common');
    const { user, company } = useSelector((state: RootState) => state.auth);
    const [vehicleImages, setVehicleImages] = useState<{ [key: string]: File | null }>({
        front: null,
        back: null,
        left: null,
        right: null
    });
    const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string | null }>({
        front: null,
        back: null,
        left: null,
        right: null
    });
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
        front: null,
        back: null,
        left: null,
        right: null
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
        plateFormat: 'new', // Default to new
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const getDirectionLabel = (direction: string) => t(`imageLabels.${direction}` as any);

    // Dynamic Options State
    const [brandOptions, setBrandOptions] = useState<VehicleBrand[]>([]);
    const [modelOptions, setModelOptions] = useState<VehicleModel[]>([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    // Fetch Brands on Mount
    React.useEffect(() => {
        const fetchBrands = async () => {
            setIsLoadingBrands(true);
            try {
                const brands = await vehiclesAPI.getBrands();
                setBrandOptions(brands);
            } catch (error) {
                console.error("Failed to fetch brands", error);
            } finally {
                setIsLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    // Fetch Models when Make (Brand) changes
    React.useEffect(() => {
        const fetchModels = async () => {
            if (!formData.make) {
                setModelOptions([]);
                return;
            }

            setIsLoadingModels(true);
            try {
                // formData.make is the brand_id
                const models = await vehiclesAPI.getModels(formData.make);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, direction: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate size (< 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t('errors.fileSize', { direction: getDirectionLabel(direction) }));
                return;
            }

            // Validate type
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                toast.error(t('errors.fileType', { direction: getDirectionLabel(direction) }));
                return;
            }

            setVehicleImages(prev => ({ ...prev, [direction]: file }));
            setPreviewUrls(prev => ({ ...prev, [direction]: URL.createObjectURL(file) }));

            // Clear error if exists
            if (formErrors[`image_${direction}`]) {
                setFormErrors(prev => ({ ...prev, [`image_${direction}`]: '' }));
            }
        }
    };

    const removeImage = (direction: string) => {
        setVehicleImages(prev => ({ ...prev, [direction]: null }));
        setPreviewUrls(prev => ({ ...prev, [direction]: null }));
        if (fileInputRefs.current[direction]) {
            fileInputRefs.current[direction]!.value = '';
        }
    };

    const bulkInputRef = useRef<HTMLInputElement>(null);

    const _handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            if (files.length > 4) {
                toast.error(t('errors.maxImages'));
                return;
            }

            const newImages = { ...vehicleImages };
            const newPreviews = { ...previewUrls };
            const directions = ['front', 'back', 'left', 'right'];

            // Iterate through selected files and assign to available (or all) slots
            // Strategy: Overwrite from the start for intuitive "bulk" action
            files.forEach((file, index) => {
                const direction = directions[index];

                // Validate size
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(t('errors.fileTooLarge', { fileName: file.name }));
                    return;
                }

                // Validate type
                if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                    toast.error(t('errors.invalidImage', { fileName: file.name }));
                    return;
                }

                newImages[direction] = file;
                newPreviews[direction] = URL.createObjectURL(file);

                // Clear error
                if (formErrors[`image_${direction}`]) {
                    setFormErrors(prev => ({ ...prev, [`image_${direction}`]: '' }));
                }
            });

            setVehicleImages(newImages);
            setPreviewUrls(newPreviews);

            // Reset input
            if (bulkInputRef.current) {
                bulkInputRef.current.value = '';
            }
        }
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        console.log('Validating form, current data:', formData);

        if (!formData.make) errors.make = t('validation.makeRequired');
        if (!formData.model) errors.model = t('validation.modelRequired');
        if (!formData.year) errors.year = t('validation.yearRequired');
        if (!formData.color) errors.color = t('validation.colorRequired');
        if (!formData.plateNumber) errors.plateNumber = t('validation.plateRequired');

        console.log('Validation errors:', errors);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error(t('validation.requiredFields'));
        }

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        console.log('Submit clicked');
        if (!validateForm()) {
            console.log('Validation failed');
            return;
        }

        // Get company ID from Redux or Cookie fallback
        let companyId = company?.id;

        // Fallback to cookie if Redux is not hydrating fast enough or on refresh
        if (!companyId) {
            try {
                const companyData = Cookies.get('company_profile');
                if (companyData) {
                    const parsed = JSON.parse(decodeURIComponent(companyData));
                    companyId = parsed.id;
                }
            } catch (e) {
                console.error("Failed to parse company cookie", e);
            }
        }

        if (!companyId) {
            toast.error(t('errors.companyIdMissing'));
            return;
        }

        try {
            setLoading(true);

            const data = new FormData();
            data.append('make', formData.make);
            data.append('model', formData.model);
            data.append('year', formData.year); // API wants integer, ensuring parsed by backend or parse here
            data.append('color', formData.color);
            data.append('license_plate', formData.plateNumber);
            // company_id is now in the URL path, not body
            // data.append('company_id', companyId);

            if (formData.mileage) {
                data.append('mileage_number', formData.mileage);
            }

            if (formData.vin) {
                data.append('vin', formData.vin);
            }

            // Convert year to int if strictly required by backend logic before sending, 
            // but FormData values are strings. Backend usually parses.
            // If backend is strict JSON it might matter, but for multipart it's strings/blobs.

            const response = await vehiclesAPI.createVehicle(companyId, data);

            if (response.success || response.id || response.vehicle_id) {
                // Assuming success if we get a response object
                toast.success(t('success.vehicleAdded'));
                router.push('/b2b/vehicles');
            } else {
                toast.error(`${t('errors.createFailed')}: ${response.message || t('errors.unknown')}`);
            }

        } catch (error: unknown) {
            console.error('Failed to create vehicle', error);

            const errorObj = error as { response?: { data?: { error?: { code?: string; message?: string }; detail?: Array<{ msg?: string }> } } };
            const errorData = errorObj?.response?.data;
            if (errorData?.error?.code === 'HTTP_409') {
                toast.error(errorData.error.message || t('errors.duplicatePlate'));
            } else {
                const detailMsg = errorData?.detail?.[0]?.msg;
                const errorMessage = error instanceof Error ? error.message : t('errors.unknown');
                toast.error(`${t('errors.createError')}: ${detailMsg || errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const _renderImageUpload = (direction: string, label: string) => (
        <div className="space-y-1.5 flex-1 min-w-[140px]">
            <label className="text-xs font-bold text-gray-700 block capitalize">{label} <span className="text-red-500">*</span></label>
            <div
                className={`border-2 border-dashed ${formErrors[`image_${direction}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} rounded-lg p-4 flex flex-col items-center justify-center transition-colors cursor-pointer aspect-square relative`}
                onClick={() => fileInputRefs.current[direction]?.click()}
            >
                <input
                    type="file"
                    ref={el => { fileInputRefs.current[direction] = el; }}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => handleFileChange(e, direction)}
                />

                {previewUrls[direction] ? (
                    <>
                        <img src={previewUrls[direction]!} alt={t('actions.imagePreview', { label })} className="w-full h-full object-cover rounded-md" />
                        <button
                            onClick={(e) => { e.stopPropagation(); removeImage(direction); }}
                            className="absolute -top-2 -end-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10"
                        >
                            <FaTimes className="text-xs" />
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-gray-400">
                            <FaImage />
                        </div>
                        <p className="text-[10px] font-medium text-gray-600 text-center">{t('actions.uploadImage', { label })}</p>
                    </>
                )}
            </div>
            {formErrors[`image_${direction}`] && <p className="text-[10px] text-red-500 text-center">{formErrors[`image_${direction}`]}</p>}
        </div>
    );

    return (
        <AdminLayout
            title={t('title')}
            subtitle={t('subtitle')}
        >
            <div className="max-w-3xl mx-auto pt-8 pb-12">

                {/* Stepper */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#FCD34D] flex items-center justify-center text-gray-900 shadow-sm z-10">
                                <FaCar className="text-sm" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{t('stepper.details')}</span>
                        </div>

                        <div className="w-24 h-0.5 bg-gray-200" />

                        <div className="flex items-center gap-2 opacity-50">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <FaCheck className="text-sm" />
                            </div>
                            <span className="text-sm font-bold text-gray-500">{t('stepper.complete')}</span>
                        </div>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('sections.vehicleInfo.title')}</h2>
                        <p className="text-sm text-gray-500">{t('sections.vehicleInfo.subtitle')}</p>
                    </div>

                    <div className="p-8 space-y-6">



                        {/* Make */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">{t('fields.make')} <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <SearchableSelect
                                    name="make"
                                    value={formData.make}
                                    onChange={(value) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            make: value,
                                            model: '' // Reset model when make changes
                                        }));
                                        // Clear error
                                        if (formErrors.make) {
                                            setFormErrors(prev => ({ ...prev, make: '' }));
                                        }
                                    }}
                                    options={brandOptions.map(brand => ({
                                        value: brand.brand_id,
                                        label: brand.brand_name
                                    }))}
                                    placeholder={isLoadingBrands ? t('placeholders.loadingBrands') : t('placeholders.selectMake')}
                                    disabled={isLoadingBrands}
                                    error={formErrors.make}
                                />
                            </div>
                        </div>

                        {/* Model */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">{t('fields.model')} <span className="text-red-500">*</span></label>
                            <div className="relative">
                                {modelOptions.length > 0 ? (
                                    <SearchableSelect
                                        name="model"
                                        value={formData.model}
                                        onChange={(value) => {
                                            setFormData(prev => ({ ...prev, model: value }));
                                            if (formErrors.model) {
                                                setFormErrors(prev => ({ ...prev, model: '' }));
                                            }
                                        }}
                                        options={modelOptions.map(model => ({
                                            value: model.model_id,
                                            label: model.model_name
                                        }))}
                                        placeholder={isLoadingModels ? t('placeholders.loadingModels') : t('placeholders.selectModel')}
                                        disabled={!formData.make || isLoadingModels}
                                        error={formErrors.model}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        placeholder={!formData.make ? t('placeholders.selectMakeFirst') : (isLoadingModels ? t('placeholders.loadingModels') : t('placeholders.enterModel'))}
                                        disabled={!formData.make || isLoadingModels}
                                        className={`w-full px-4 py-3 border ${formErrors.model ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400`}
                                    />
                                )}
                            </div>
                            {modelOptions.length === 0 && formErrors.model && <p className="text-xs text-red-500">{formErrors.model}</p>}
                        </div>

                        {/* Year */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">{t('fields.year')} <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${formErrors.year ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent`}
                                >
                                    <option value="">{t('placeholders.selectYear')}</option>
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            {formErrors.year && <p className="text-xs text-red-500">{formErrors.year}</p>}
                        </div>

                        {/* Mileage */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">{t('fields.mileage')}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="mileage"
                                    value={formData.mileage}
                                    onChange={handleChange}
                                    placeholder={t('placeholders.mileage')}
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent"
                                />
                                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">{t('units.km')}</span>
                            </div>
                        </div>

                        {/* Color - New Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">{t('fields.color')} <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder={t('placeholders.color')}
                                    className={`w-full px-4 py-3 border ${formErrors.color ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent`}
                                />
                                <div className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaPalette />
                                </div>
                            </div>
                            {formErrors.color && <p className="text-xs text-red-500">{formErrors.color}</p>}
                        </div>

                        {/* Plate Number & Format Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-700 block">{t('fields.licensePlate')} <span className="text-red-500">*</span></label>

                            {/* Format Selector */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, plateFormat: 'new', plateNumber: '' }))}
                                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.plateFormat === 'new'
                                        ? 'border-[#FCD34D] bg-[#FCD34D]/5'
                                        : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.plateFormat === 'new' ? 'border-[#FCD34D]' : 'border-gray-300'}`}>
                                            {formData.plateFormat === 'new' && <div className="w-2 h-2 bg-[#FCD34D] rounded-full" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">{t('plate.newFormat')}</span>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-16 w-full relative">
                                        <img src="/assets/plates/new-plate.png" alt={t('plate.newFormat')} className="w-full h-full object-contain" />
                                    </div>
                                </div>

                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, plateFormat: 'old', plateNumber: '' }))}
                                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.plateFormat === 'old'
                                        ? 'border-[#FCD34D] bg-[#FCD34D]/5'
                                        : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.plateFormat === 'old' ? 'border-[#FCD34D]' : 'border-gray-300'}`}>
                                            {formData.plateFormat === 'old' && <div className="w-2 h-2 bg-[#FCD34D] rounded-full" />}
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">{t('plate.oldFormat')}</span>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-16 w-full relative">
                                        <img src="/assets/plates/old-plate.png" alt={t('plate.oldFormat')} className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                {formData.plateFormat === 'new' ? (
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1 max-w-[80px]">
                                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('plate.code')}</label>
                                            <input
                                                type="text"
                                                maxLength={2}
                                                placeholder="22"
                                                className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    const current = formData.plateNumber.split(' ');
                                                    const letter = current[1] || '';
                                                    const num = current[2] || '';
                                                    setFormData(prev => ({ ...prev, plateNumber: `${val} ${letter} ${num}`.trim() }));
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 max-w-[80px]">
                                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('plate.letter')}</label>
                                            <input
                                                type="text"
                                                maxLength={2}
                                                placeholder="GG"
                                                className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D] uppercase"
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                                                    e.target.value = val;
                                                    const current = formData.plateNumber.split(' ');
                                                    const code = current[0] || '';
                                                    const num = current[2] || '';
                                                    setFormData(prev => ({ ...prev, plateNumber: `${code} ${val} ${num}`.trim() }));
                                                }}
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('plate.number')}</label>
                                            <input
                                                type="text"
                                                maxLength={5}
                                                placeholder="99720"
                                                className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D] tracking-widest"
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    const current = formData.plateNumber.split(' ');
                                                    const code = current[0] || '';
                                                    const letter = current[1] || '';
                                                    setFormData(prev => ({ ...prev, plateNumber: `${code} ${letter} ${val}`.trim() }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1 max-w-[100px]">
                                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('plate.code')}</label>
                                            <input
                                                type="text"
                                                maxLength={2}
                                                placeholder="54"
                                                className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    const current = formData.plateNumber.replace(/\s/g, '');
                                                    const _num = current.length > 2 ? current.substring(current.length - 6) : '';
                                                    // Simple fallback logic since splitting is harder without separators. 
                                                    // Better: use explicit state for parts, but sticking to existing pattern:
                                                    // Actually for Old, it's just contiguous numbers?
                                                    // Or separate fields? "Code" and "Number".
                                                    // Let's assume space separation for internal storage to avoid ambiguity: "54 8306"
                                                    const parts = formData.plateNumber.split(' ');
                                                    const numberPart = parts[1] || '';
                                                    setFormData(prev => ({ ...prev, plateNumber: `${val} ${numberPart}`.trim() }));
                                                }}
                                            />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t('plate.number')}</label>
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="8306"
                                                className="w-full px-3 py-2 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCD34D] tracking-widest"
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    const parts = formData.plateNumber.split(' ');
                                                    const codePart = parts[0] || '';
                                                    setFormData(prev => ({ ...prev, plateNumber: `${codePart} ${val}`.trim() }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {formErrors.plateNumber && <p className="text-xs text-red-500">{formErrors.plateNumber}</p>}
                        </div>

                        {/* VIN Number */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 block">{t('fields.vin')}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleChange}
                                    placeholder={t('placeholders.vin')}
                                    maxLength={17}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent font-mono tracking-wide"
                                />
                                <div className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaBarcode className="text-lg" />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400">{t('helpers.vin')}</p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <FaArrowLeft className="text-xs rtl:rotate-180" /> {tCommon('actions.cancel')}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-2.5 bg-[#FCD34D] hover:bg-[#FBBF24] text-gray-900 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('actions.adding')}
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="text-xs" /> {t('actions.addVehicle')}
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Help Box */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600 mt-0.5">
                        <FaInfoCircle className="text-sm" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 mb-1">{t('help.title')}</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            {t('help.vinInfo')} <br />
                            {t('help.imageInfo')}
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
