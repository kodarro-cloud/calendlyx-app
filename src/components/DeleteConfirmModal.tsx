import { X } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  message?: string;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal = ({
  title,
  message,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-red-700">{title}</h3>
          <button
            onClick={onCancel}
            className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition duration-200"
            title="Close modal"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {message && (
            <p className="text-slate-600 text-sm mb-4">{message}</p>
          )}
          <p className="text-slate-700 text-sm font-medium">
            This action cannot be undone.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition duration-200"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
