import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = usePlacement();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#4ADE80] flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#FCD34D] flex-shrink-0" />,
          error: <AlertOctagon className="w-5 h-5 text-[#FCA5A5] flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-[#A78BFA] flex-shrink-0" />
        };

        const borders = {
          success: 'border-[#22C55E]/40 bg-[#151C32]/95 text-[#F8FAFC] shadow-2xl',
          warning: 'border-[#F59E0B]/40 bg-[#151C32]/95 text-[#F8FAFC] shadow-2xl',
          error: 'border-[#EF4444]/40 bg-[#151C32]/95 text-[#F8FAFC] shadow-2xl',
          info: 'border-[#7C3AED]/40 bg-[#151C32]/95 text-[#F8FAFC] shadow-2xl'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all transform animate-slideIn ${borders[toast.type] || borders.info}`}
          >
            {icons[toast.type] || icons.info}
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-[#F8FAFC]">{toast.title}</h4>
              <p className="text-xs text-[#CBD5E1] mt-0.5">{toast.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
