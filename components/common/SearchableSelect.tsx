import React, { useState, useEffect, useRef } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    error?: string;
    name?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    disabled = false,
    isLoading = false,
    error,
    name: _name
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial selected label
    const selectedOption = options.find(opt => opt.value === value);

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset search term to selected label if closed without selecting
                // But simplified: just clear search term so next open is fresh or keep it?
                // UX decision: Let's clear search term when closing
                setSearchTerm('');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                // Focus input when opening
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Main Display Box */}
            <div
                className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg text-sm text-gray-900 bg-white cursor-pointer flex items-center justify-between ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-[#FCD34D]`}
                onClick={toggleDropdown}
                tabIndex={0}
            >
                <span className={`block truncate ${!selectedOption ? 'text-gray-500' : ''}`}>
                    {isLoading ? 'Loading...' : (selectedOption ? selectedOption.label : placeholder)}
                </span>
                <div className="pointer-events-none text-gray-400">
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#FCD34D] focus:ring-1 focus:ring-[#FCD34D]"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
                        />
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${value === option.value ? 'bg-yellow-50 text-yellow-900 font-medium' : 'text-gray-700'}`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
    );
}
