"use client";

import React from 'react';
import { useStore, Toast } from '@/lib/store';
import { Check, Info, AlertCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((toast: Toast) => {
        let Icon = Info;
        let iconColor = "text-stone-500";
        let borderColor = "border-stone-200/80";
        let bgStyle = "bg-white/95 backdrop-blur-sm";

        if (toast.type === 'success') {
          Icon = Check;
          iconColor = "text-emerald-600";
          borderColor = "border-emerald-200/80";
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = "text-red-600";
          borderColor = "border-red-200/80";
        }

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-md border shadow-md ${borderColor} ${bgStyle} hover:shadow-lg transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-5 fade-in-30 flex-row relative overflow-hidden group`}
            role="alert"
          >
            {/* Minimal top status line for visual elegance */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-stone-600'}`}></div>
            
            <div className="mt-0.5 pointer-events-none shrink-0">
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0 pr-4 pointer-events-none">
              <p className="text-xs font-semibold text-stone-900 leading-normal">
                {toast.message}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="opacity-0 group-hover:opacity-40 text-stone-400 hover:text-stone-900 transition-opacity p-0.5 rounded cursor-pointer shrink-0 absolute top-3 right-3"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
