import { getErrorMessage, isNetworkError } from '../lib/error-handler';

interface ErrorMessageProps {
  error: unknown;
  customMessage?: string;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({
  error,
  customMessage,
  onDismiss,
  className = '',
}: ErrorMessageProps) {
  if (!error) return null;

  const message = customMessage || getErrorMessage(error);
  const isNetwork = isNetworkError(error);

  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${
        isNetwork
          ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
          : 'bg-red-50 border-red-200 text-red-800'
      } ${className}`}
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="flex-shrink-0 mt-0.5">
          {isNetwork ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${
            isNetwork ? 'text-yellow-600 hover:text-yellow-800' : 'text-red-600 hover:text-red-800'
          } transition-colors`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

