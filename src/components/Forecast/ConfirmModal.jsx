import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ 
    isOpen, 
    title = 'Konfirmasi', 
    message = 'Apakah Anda yakin?',
    onConfirm, 
    onCancel, 
    confirmText = 'Hapus',
    cancelText = 'Batal',
    isDangerous = true,
    isLoading = false 
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isDangerous ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                <AlertCircle size={20} className={isDangerous ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h2>
                        </div>
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={20} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                isDangerous 
                                    ? 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600'
                            }`}
                        >
                            {isLoading && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmModal;
