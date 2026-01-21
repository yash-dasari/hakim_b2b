import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaBuilding, FaPen, FaFileAlt, FaEye, FaPhoneAlt, FaEnvelope, FaUser, FaInfoCircle, FaCheckCircle, FaFileUpload, FaSave, FaMapMarkerAlt, FaDownload, FaTimes } from 'react-icons/fa';
import { authAPI } from '../../services/api/auth.api';
import { toast } from 'react-hot-toast';

export default function AccountPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        companyName: '',
        tradeLicense: '',
        address: '',
        city: '',
        contactName: '',
        jobTitle: '',
        email: '',
        phone: '',
        tradeLicenseUrl: '',
        tradeLicenseSignedUrl: '',
        tradeLicenseNumber: '',
        isActive: false,
        createdAt: '',
        updatedAt: ''
    });

    // Password Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false
    });
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    useEffect(() => {
        const { newPassword } = passwordData;
        setPasswordValidations({
            minLength: newPassword.length >= 6,
            hasUpper: /[A-Z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
        });
    }, [passwordData.newPassword]);

    const handlePasswordChange = async () => {
        if (!companyId) return;

        // Final Validation Check
        const { minLength, hasUpper, hasNumber, hasSpecial } = passwordValidations;
        if (!minLength || !hasUpper || !hasNumber || !hasSpecial) {
            toast.error('Password does not meet all requirements');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setIsPasswordSaving(true);
            await authAPI.changePassword(companyId, passwordData.newPassword);
            toast.success('Password changed successfully');
            setIsPasswordModalOpen(false);
            setPasswordData({ newPassword: '', confirmPassword: '' }); // Reset
        } catch (error: unknown) {
            console.error('Failed to change password:', error);
            const errorObj = error as { response?: { data?: { message?: string } } };
            toast.error(errorObj?.response?.data?.message || 'Failed to change password');
        } finally {
            setIsPasswordSaving(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [companyRes, contactRes] = await Promise.all([
                authAPI.getCompanyProfile(),
                authAPI.getPrimaryContactMe()
            ]);

            if (companyRes.success && companyRes.data) {
                const data = companyRes.data;
                setCompanyId(data.company_id);
                setFormData(prev => ({
                    ...prev,
                    companyName: data.name || '',
                    tradeLicense: data.trade_license_number || '',
                    address: data.address || '',
                    city: data.city || '',
                    phone: data.phone || '',
                    tradeLicenseUrl: data.trade_license_url || '',
                    tradeLicenseSignedUrl: data.trade_license_signed_url || '',
                    tradeLicenseNumber: data.trade_license_number || '',
                    isActive: data.is_active,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at
                }));
            }

            if (contactRes.success && contactRes.data) {
                const contact = contactRes.data;
                setFormData(prev => ({
                    ...prev,
                    contactName: contact.full_name || '',
                    email: contact.email || '',
                    jobTitle: contact.job_title || '',
                    phone: contact.phone || prev.phone || '' // Use contact phone, fallback to company phone
                }));
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load account information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!companyId) return;

        try {
            setIsLoading(true);

            // Prepare company data payload
            const companyData = {
                name: formData.companyName,
                address: formData.address,
                city: formData.city,
                phone: formData.phone,
                trade_license_number: formData.tradeLicense
            };

            // Prepare primary contact payload
            const contactData = {
                full_name: formData.contactName,
                job_title: formData.jobTitle,
                email: formData.email,
                phone: formData.phone
            };

            await Promise.all([
                authAPI.updateCompanyInformation(companyId, companyData, tradeLicenseFile || undefined),
                authAPI.updatePrimaryContact(companyId, contactData)
            ]);

            toast.success('Account information updated successfully');
            setIsEditing(false);
            setTradeLicenseFile(null);
            fetchInitialData(); // Refresh data
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setTradeLicenseFile(e.target.files[0]);
        }
    };

    return (
        <AdminLayout
            title="Account Settings"
            subtitle={isEditing ? "Manage your business account information and settings" : "View and manage your business account information"}
            headerActions={
                <div className="flex items-center gap-3">
                    {/* Header profile or notification icons */}
                </div>
            }
        >
            <div className="space-y-6 w-full pb-20">

                {/* Company Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                            <span className="text-yellow-500"><FaBuilding /></span>
                            <h2 className="text-base font-bold text-gray-900">Company Information</h2>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-xs font-bold text-gray-900 shadow-sm transition-colors"
                            >
                                <FaPen className="text-[10px]" /> Edit Information
                            </button>
                        )}
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-8">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Company Name</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900">{formData.companyName}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trade License Number</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.tradeLicense}
                                        onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900">{formData.tradeLicense || 'Not set'}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Address</p>
                                {isEditing ? (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-gray-100 p-1.5 rounded-md">
                                            <FaMapMarkerAlt className="text-gray-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                        <span className="text-[#FCD34D]">📍</span> {formData.address}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D] bg-gray-100/50"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900">{formData.city}, United Arab Emirates</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            {!isEditing && (
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trade License Document</p>
                                    {/* {formData.tradeLicenseSignedUrl && (
                                        <a
                                            href={formData.tradeLicenseSignedUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-[10px] font-bold text-[#FCD34D] flex items-center gap-1 hover:text-[#FBBF24]"
                                        >
                                            <FaDownload /> Download
                                        </a>
                                    )} */}
                                </div>
                            )}

                            {isEditing ? (
                                <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50/30">
                                    <FaFileAlt className="text-gray-300 text-3xl mb-2" />
                                    <p className="text-xs text-gray-500 mb-4">
                                        {tradeLicenseFile ? tradeLicenseFile.name : (formData.tradeLicenseUrl ? 'Current Document Uploaded' : 'No document uploaded')}
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-xs font-bold text-gray-900 shadow-sm flex items-center gap-2"
                                    >
                                        <FaFileUpload /> {tradeLicenseFile ? 'Change Document' : 'Upload Document'}
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                            <FaFileAlt className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {formData.tradeLicenseUrl ? 'Trade License Document' : 'No Document'}
                                            </p>
                                        </div>
                                    </div>
                                    {formData.tradeLicenseSignedUrl ? (
                                        <a
                                            href={formData.tradeLicenseSignedUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Download License"
                                            className="p-2 text-gray-400 hover:text-gray-600"
                                            download
                                        >
                                            <FaDownload />
                                        </a>
                                    ) : formData.tradeLicenseUrl && (
                                        <a href={formData.tradeLicenseUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-600">
                                            <FaEye />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Primary Contact Person Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                            <span className="text-yellow-500"><FaUser /></span>
                            <h2 className="text-base font-bold text-gray-900">Primary Contact Person</h2>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-xs font-bold text-gray-900 shadow-sm transition-colors"
                            >
                                <FaPen className="text-[10px]" /> Edit Contact
                            </button>
                        )}
                    </div>

                    <div className="p-8">
                        {!isEditing && (
                            <div className="flex items-center gap-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{formData.contactName}</h3>
                                    <p className="text-sm text-gray-500">{formData.jobTitle}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-8">
                            {isEditing && (
                                <>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                                        <input
                                            type="text"
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Job Title</p>
                                        <input
                                            type="text"
                                            value={formData.jobTitle}
                                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <span className="text-[#FCD34D]"><FaEnvelope /></span> {formData.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FCD34D]"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <span className="text-[#FCD34D]"><FaPhoneAlt /></span> {formData.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="px-6 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-sm font-bold text-gray-900 shadow-sm transition-colors whitespace-nowrap h-10"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Details Card */}
                {!isEditing && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <span className="text-yellow-500"><FaInfoCircle /></span>
                                <h2 className="text-base font-bold text-gray-900">Account Details</h2>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account Status</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${formData.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    <FaCheckCircle className="text-[10px]" /> {formData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                                <p className="text-sm font-bold text-gray-900">{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
                                <p className="text-sm font-bold text-gray-900">{formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions Footer */}
                {isEditing && (
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel Changes
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-sm font-bold text-gray-900 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : <><FaSave className="text-xs" /> Save Changes</>}
                        </button>
                    </div>
                )}

            </div>

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">New Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-bold text-gray-500 mb-2">Password Requirements:</p>
                                <div className={`flex items-center gap-2 text-xs ${passwordValidations.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                                    <FaCheckCircle className={passwordValidations.hasUpper ? 'opacity-100' : 'opacity-0'} />
                                    <span>At least one capital letter</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordValidations.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                                    <FaCheckCircle className={passwordValidations.hasNumber ? 'opacity-100' : 'opacity-0'} />
                                    <span>At least one number</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordValidations.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                                    <FaCheckCircle className={passwordValidations.hasSpecial ? 'opacity-100' : 'opacity-0'} />
                                    <span>At least one special character</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordValidations.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                                    <FaCheckCircle className={passwordValidations.minLength ? 'opacity-100' : 'opacity-0'} />
                                    <span>Minimum 6 characters</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">Confirm Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FCD34D] focus:border-transparent"
                                    placeholder="Confirm new password"
                                />
                                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                    <p className="text-xs text-red-500">Passwords do not match</p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                disabled={isPasswordSaving || !Object.values(passwordValidations).every(Boolean) || passwordData.newPassword !== passwordData.confirmPassword}
                                className="px-6 py-2 bg-[#FCD34D] hover:bg-[#FBBF24] rounded-lg text-sm font-bold text-gray-900 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isPasswordSaving ? 'Saving...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
