import Link from 'next/link';
import { FaSearch, FaHome, FaArrowLeft } from 'react-icons/fa';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <FaSearch className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition duration-200 font-medium flex items-center justify-center gap-2"
          >
            <FaHome />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition duration-200 font-medium flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
} 