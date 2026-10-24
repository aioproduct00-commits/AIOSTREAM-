import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#101925]/95 border-emerald-500/30 text-emerald-300'
                : isError
                ? 'bg-[#251014]/95 border-rose-500/30 text-rose-300'
                : 'bg-[#131722]/95 border-slate-700/60 text-slate-200'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}

            <p className="text-xs font-medium text-slate-100 flex-1 leading-snug">{toast.message}</p>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
