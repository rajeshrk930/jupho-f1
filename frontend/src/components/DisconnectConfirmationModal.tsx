'use client';

import { AlertTriangle, Facebook, X } from 'lucide-react';

interface DisconnectConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountName?: string;
  isLoading?: boolean;
}

export default function DisconnectConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  accountName,
  isLoading = false,
}: DisconnectConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Disconnect Meta Account</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              ⚠️ This action will have the following effects:
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Stop all active campaigns</li>
              <li>Disable lead generation tracking</li>
              <li>Remove access to your ad accounts</li>
              <li>Clear Facebook connection data</li>
            </ul>
          </div>

          {/* Account Info */}
          {accountName && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">CONNECTED ACCOUNT</p>
                <p className="text-sm text-gray-900 font-semibold">{accountName}</p>
              </div>
            </div>
          )}

          {/* Confirmation Question */}
          <p className="text-gray-700 text-sm">
            Are you sure you want to disconnect your Meta account? You can always reconnect later.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
